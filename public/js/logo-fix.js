(function () {
  var map = {
    'logo.clearbit.com/namecheap.com': '/logos/namecheap.svg',
    'logo.clearbit.com/godaddy.com': '/logos/godaddy.svg',
    'logo.clearbit.com/porkbun.com': '/logos/porkbun.svg',
    'logo.clearbit.com/name.com': '/logos/namecom.svg',
    'cdn.simpleicons.org/hostinger': '/logos/hostinger.svg',
    'cdn.simpleicons.org/cloudflare/F38020': '/logos/cloudflare.svg'
  };
  function fix(img) {
    var src = img.getAttribute('src') || '';
    for (var key in map) {
      if (src.indexOf(key) !== -1) {
        img.setAttribute('src', map[key]);
        img.style.objectFit = 'contain';
        break;
      }
    }
  }
  function run() {
    document.querySelectorAll('img[src]').forEach(fix);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
