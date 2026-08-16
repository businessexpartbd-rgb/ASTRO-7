/**
 * Creavix Reviews — Firebase Auth (Google) + Firestore
 * Config: /config.json → firebase { apiKey, authDomain, projectId, ... }
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

const starLabels = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
let app = null;
let auth = null;
let db = null;
let currentUser = null;
let selectedStars = 0;
let reviews = [];
let firebaseReady = false;

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function starsHtml(n) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += i <= n ? '★' : '☆';
  return s;
}

function stats(list) {
  const counts = [0, 0, 0, 0, 0, 0];
  let sum = 0;
  list.forEach((r) => {
    const s = Math.min(5, Math.max(1, parseInt(r.stars, 10) || 0));
    counts[s]++;
    sum += s;
  });
  const n = list.length;
  return { counts, total: n, avg: n ? sum / n : 0 };
}

function renderSummary(list) {
  const st = stats(list);
  const avgEl = $('avg-score');
  const starsEl = $('avg-stars');
  const countEl = $('rating-count');
  const barsEl = $('rating-bars');
  if (avgEl) avgEl.textContent = st.total ? st.avg.toFixed(1) : '0.0';
  if (starsEl) starsEl.textContent = starsHtml(Math.round(st.avg));
  if (countEl) countEl.textContent = st.total + (st.total === 1 ? ' rating' : ' ratings');
  if (!barsEl) return;
  let html = '';
  for (let i = 5; i >= 1; i--) {
    const pct = st.total ? Math.round((st.counts[i] / st.total) * 100) : 0;
    html +=
      '<div class="bar-row"><span>' +
      i +
      '</span><div class="bar-track"><div class="bar-fill" style="width:' +
      pct +
      '%"></div></div><span>' +
      pct +
      '%</span></div>';
  }
  barsEl.innerHTML = html;
}

function reviewCard(r) {
  const initial = (r.name || 'U').charAt(0).toUpperCase();
  const avatar = r.picture
    ? '<img class="review-avatar" src="' + escapeHtml(r.picture) + '" alt="" width="40" height="40" />'
    : '<div class="review-avatar-fallback">' + initial + '</div>';
  let date = '';
  try {
    if (r.createdAt?.toDate) date = r.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    else if (r.createdAt) date = new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (_) {}
  return (
    '<article class="review-item">' +
    '<div class="review-top">' +
    avatar +
    '<div><div class="review-name">' +
    escapeHtml(r.name || 'User') +
    '</div><div class="review-meta">' +
    date +
    ' · Verified Google</div></div></div>' +
    '<div class="review-stars">' +
    starsHtml(r.stars) +
    '</div>' +
    '<div class="review-body">' +
    escapeHtml(r.text || '') +
    '</div></article>'
  );
}

function renderList(list) {
  const listEl = $('reviews-list');
  const emptyEl = $('reviews-empty');
  const moreBtn = $('btn-see-more');
  if (!listEl) return;
  if (list.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) {
      listEl.appendChild(emptyEl);
      emptyEl.hidden = false;
    }
    if (moreBtn) moreBtn.hidden = true;
    return;
  }
  if (emptyEl) emptyEl.hidden = true;
  listEl.innerHTML = list.slice(0, 3).map(reviewCard).join('');
  if (moreBtn) {
    moreBtn.hidden = list.length <= 3;
    moreBtn.textContent = 'See all ' + list.length + ' reviews';
  }
}

function renderModal(list) {
  const body = $('modal-body');
  if (body)
    body.innerHTML =
      list.map(reviewCard).join('') ||
      '<p style="color:#64748B;text-align:center;padding:1rem">No reviews yet</p>';
}

function refresh() {
  renderSummary(reviews);
  renderList(reviews);
  renderModal(reviews);
}

function showAuthUI() {
  const form = $('review-form');
  const authArea = $('google-auth-area');
  const chip = $('user-chip');
  if (currentUser) {
    if (authArea) authArea.hidden = true;
    if (form) form.hidden = false;
    if (chip) {
      const img = currentUser.picture
        ? '<img src="' + escapeHtml(currentUser.picture) + '" alt="" width="32" height="32" />'
        : '';
      chip.innerHTML =
        img + '<span>' + escapeHtml(currentUser.name || currentUser.email || 'User') + ' · Verified</span>';
    }
  } else {
    if (authArea) authArea.hidden = false;
    if (form) form.hidden = true;
  }
}

function setStars(n) {
  selectedStars = n;
  document.querySelectorAll('#star-picker .star-btn').forEach((btn) => {
    const v = parseInt(btn.getAttribute('data-star'), 10);
    btn.classList.toggle('on', v <= n);
  });
  const label = $('star-label');
  if (label) label.textContent = n ? n + ' · ' + starLabels[n] : 'Tap to rate';
}

async function loadReviewsFromFirestore() {
  if (!db) return [];
  try {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(200));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId || d.id,
        name: data.name || 'User',
        email: data.email || '',
        picture: data.picture || '',
        stars: data.stars || 0,
        text: data.text || '',
        createdAt: data.createdAt || null,
        verified: true,
      };
    });
  } catch (err) {
    console.warn('Firestore load error', err);
    return [];
  }
}

async function saveReviewToFirestore(entry) {
  if (!db || !currentUser) throw new Error('Not signed in');
  const ref = doc(db, 'reviews', currentUser.uid);
  await setDoc(
    ref,
    {
      userId: currentUser.uid,
      name: entry.name,
      email: entry.email || '',
      picture: entry.picture || '',
      stars: entry.stars,
      text: entry.text,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

function isFirebaseConfigured(fb) {
  return !!(fb && fb.apiKey && fb.projectId && fb.appId && fb.authDomain);
}

async function googleSignIn() {
  if (!auth) return;
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    // Mobile / blocked popup → redirect
    if (err && (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user')) {
      try {
        await signInWithRedirect(auth, provider);
      } catch (e2) {
        alert('Google sign-in failed. Please try again.');
      }
    } else if (err && err.code !== 'auth/popup-closed-by-user') {
      console.warn(err);
      alert('Google sign-in failed. Check Firebase Google provider is enabled.');
    }
  }
}

function closeModal() {
  const modal = $('reviews-modal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openModal() {
  const modal = $('reviews-modal');
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

async function boot() {
  closeModal();

  let cfg = {};
  try {
    const res = await fetch('/config.json?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) cfg = await res.json();
  } catch (_) {}

  const fb = cfg.firebase || {};
  const hint = $('auth-hint');
  const btn = $('btn-google');
  const label = $('btn-google-label');

  if (!isFirebaseConfigured(fb)) {
    if (label) label.textContent = 'Continue with Google';
    if (hint) {
      hint.innerHTML =
        'Firebase setup pending. Add config in <code>public/config.json</code> — see SETUP-FIREBASE.md';
    }
    if (btn) {
      btn.onclick = () => {
        alert('Firebase config needed once. Free setup: Firebase Console → Project settings → Your apps.');
      };
    }
    reviews = [];
    refresh();
    showAuthUI();
    return;
  }

  try {
    app = initializeApp(fb);
    auth = getAuth(app);
    db = getFirestore(app);
    firebaseReady = true;
  } catch (err) {
    console.error(err);
    if (hint) hint.textContent = 'Firebase init failed. Check config.json values.';
    return;
  }

  if (label) label.textContent = 'Continue with Google';
  if (hint) hint.textContent = 'Tap to choose any Google account on your device and leave a verified review.';

  try {
    await getRedirectResult(auth);
  } catch (_) {}

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = {
        uid: user.uid,
        name: user.displayName || user.email || 'User',
        email: user.email || '',
        picture: user.photoURL || '',
      };
    } else {
      currentUser = null;
    }
    showAuthUI();
  });

  reviews = await loadReviewsFromFirestore();
  refresh();

  if (btn) btn.onclick = () => googleSignIn();

  const starPicker = $('star-picker');
  if (starPicker) {
    starPicker.addEventListener('click', (e) => {
      const t = e.target.closest('.star-btn');
      if (!t) return;
      setStars(parseInt(t.getAttribute('data-star'), 10));
    });
  }

  const form = $('review-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = $('form-msg');
      const submitBtn = $('btn-submit-review');
      if (!currentUser) return;

      if (!selectedStars) {
        if (msg) {
          msg.hidden = false;
          msg.className = 'form-msg err';
          msg.textContent = 'Please select a star rating.';
        }
        return;
      }
      const text = ($('review-text')?.value || '').trim();
      if (text.length < 3) {
        if (msg) {
          msg.hidden = false;
          msg.className = 'form-msg err';
          msg.textContent = 'Please write a short comment.';
        }
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      try {
        await saveReviewToFirestore({
          name: currentUser.name,
          email: currentUser.email,
          picture: currentUser.picture,
          stars: selectedStars,
          text,
        });
        reviews = await loadReviewsFromFirestore();
        refresh();
        if ($('review-text')) $('review-text').value = '';
        setStars(0);
        if (msg) {
          msg.hidden = false;
          msg.className = 'form-msg';
          msg.textContent = 'Review saved permanently. Thank you!';
        }
      } catch (err) {
        console.error(err);
        if (msg) {
          msg.hidden = false;
          msg.className = 'form-msg err';
          msg.textContent =
            'Could not save. Check Firestore rules & Google provider in Firebase Console.';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  const signout = $('btn-signout');
  if (signout) {
    signout.addEventListener('click', async () => {
      try {
        await signOut(auth);
      } catch (_) {}
      currentUser = null;
      showAuthUI();
    });
  }

  $('btn-see-more')?.addEventListener('click', openModal);
  $('modal-close')?.addEventListener('click', closeModal);
  $('modal-backdrop')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
