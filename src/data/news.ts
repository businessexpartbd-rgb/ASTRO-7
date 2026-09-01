export type NewsItem = {
  slug: string;
  category: string;
  categoryEn: string;
  district: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  image: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  featured?: boolean;
  rural?: boolean;
  content: string[];
};

export const news: NewsItem[] = [
  {
    slug: 'village-road-river-economy',
    category: 'গ্রামবাংলা', categoryEn: 'Rural Bangladesh', district: 'নেত্রকোণা',
    title: 'গ্রামীণ সড়ক ও নদীকেন্দ্রিক অর্থনীতিতে বদলে যেতে পারে জনজীবন',
    titleEn: 'Village roads and river-based economy can transform local life',
    excerpt: 'যোগাযোগ, কৃষি ও স্থানীয় বাজারকে একই পরিকল্পনায় আনলে গ্রামের মানুষের কর্মসংস্থানের নতুন পথ তৈরি হতে পারে।',
    excerptEn: 'Connecting transport, agriculture and local markets can create new rural employment.',
    image: '/images/rural-bangladesh-small.webp', publishedAt: '2026-09-01T08:15:00+06:00', updatedAt: '2026-09-01T11:20:00+06:00',
    author: 'গ্রাম প্রতিনিধি', featured: true, rural: true,
    content: ['গ্রামের উন্নয়নের কেন্দ্রবিন্দুতে স্থানীয় মানুষের প্রয়োজনকে রাখলে সড়ক, বাজার ও নদীপথ—তিনটি খাত একসঙ্গে কার্যকর হয়ে ওঠে। কৃষিপণ্য দ্রুত বাজারে পৌঁছানো এবং স্থানীয় পর্যায়ে সংরক্ষণের সুযোগ তৈরি হলে উৎপাদক ন্যায্য মূল্য পেতে পারেন।', 'এই নমুনা প্রতিবেদনটি ওয়েবসাইটের কাঠামো প্রদর্শনের জন্য রাখা হয়েছে। পরবর্তী ধাপে মাঠপর্যায়ের যাচাইকৃত তথ্য, সংশ্লিষ্ট ব্যক্তিদের বক্তব্য ও নিজস্ব আলোকচিত্র দিয়ে প্রতিবেদনটি প্রতিস্থাপন করা হবে।']
  },
  {
    slug: 'farmers-market-supply-chain',
    category: 'অর্থনীতি', categoryEn: 'Economy', district: 'ময়মনসিংহ',
    title: 'কৃষকের বাজারে সরবরাহব্যবস্থা আধুনিক হলে কমবে অপচয়',
    titleEn: 'Modern supply chains can reduce waste at farmers markets',
    excerpt: 'স্থানীয় হাট, শীতল সংরক্ষণ ও পরিবহন ব্যবস্থার সমন্বয়ে কৃষিপণ্যের অপচয় কমানোর সুযোগ রয়েছে।',
    excerptEn: 'Local markets, cold storage and transport can work together to reduce food waste.',
    image: '/images/rural-market-small.webp', publishedAt: '2026-09-01T07:40:00+06:00', updatedAt: '2026-09-01T10:05:00+06:00', author: 'অর্থনীতি ডেস্ক', rural: true,
    content: ['কৃষকের কাছ থেকে ভোক্তার কাছে পণ্য পৌঁছানোর প্রতিটি ধাপে সময় ও সংরক্ষণ গুরুত্বপূর্ণ। স্থানীয় পর্যায়ে তথ্যভিত্তিক চাহিদা, পরিবহন ও ন্যায্যমূল্যের ব্যবস্থা থাকলে কৃষক ও ক্রেতা উভয়েই উপকৃত হন।', 'এটি একটি নমুনা কনটেন্ট। প্রকাশের আগে বাস্তব তথ্য, নির্ভরযোগ্য উৎস এবং সংশ্লিষ্ট এলাকার ছবি সংযোজন করা হবে।']
  },
  {
    slug: 'monsoon-river-embankment-preparedness',
    category: 'আবহাওয়া', categoryEn: 'Weather', district: 'কুড়িগ্রাম',
    title: 'বর্ষায় নদী ও বাঁধ পরিস্থিতি: স্থানীয় প্রস্তুতি কেন জরুরি',
    titleEn: 'Monsoon rivers and embankments: why local preparedness matters',
    excerpt: 'নদীর পানি, বাঁধ ও আশ্রয়কেন্দ্রের তথ্য দ্রুত পৌঁছালে ঝুঁকিপূর্ণ এলাকার মানুষ আগাম প্রস্তুতি নিতে পারেন।',
    excerptEn: 'Timely river, embankment and shelter information helps communities prepare early.',
    image: '/images/river-weather-small.webp', publishedAt: '2026-08-31T18:20:00+06:00', updatedAt: '2026-09-01T09:30:00+06:00', author: 'আবহাওয়া ডেস্ক',
    content: ['বর্ষা মৌসুমে নদীতীরবর্তী মানুষের জন্য নির্ভরযোগ্য তথ্য সবচেয়ে গুরুত্বপূর্ণ। পানি বৃদ্ধির হার, স্থানীয় বাঁধের অবস্থা এবং নিরাপদ আশ্রয়ের তথ্য এক জায়গায় পাওয়া গেলে দ্রুত সিদ্ধান্ত নেওয়া সহজ হয়।', 'এই প্রতিবেদনটি নমুনা হিসেবে প্রকাশিত। পরবর্তী আপডেটে সরকারি তথ্য ও স্থানীয় প্রতিনিধির যাচাই যুক্ত হবে।']
  },
  {
    slug: 'rural-youth-football-talent',
    category: 'খেলাধুলা', categoryEn: 'Sports', district: 'নেত্রকোণা',
    title: 'গ্রামের মাঠেই বেড়ে উঠছে সম্ভাবনাময় তরুণ ফুটবলার',
    titleEn: 'Promising young footballers are emerging from village fields',
    excerpt: 'নিয়মিত প্রশিক্ষণ ও জেলা পর্যায়ের প্রতিযোগিতা বাড়লে গ্রামের প্রতিভারা পেতে পারে বড় মঞ্চ।',
    excerptEn: 'Training and district tournaments can take rural talent to a bigger stage.',
    image: '/images/rural-football-small.webp', publishedAt: '2026-08-31T16:10:00+06:00', updatedAt: '2026-08-31T20:15:00+06:00', author: 'ক্রীড়া প্রতিবেদক', rural: true,
    content: ['দেশের প্রত্যন্ত অঞ্চলের অনেক তরুণ নিয়মিত অনুশীলনের সুযোগ না পেয়েও স্থানীয় প্রতিযোগিতায় দক্ষতা দেখাচ্ছেন। পরিকল্পিত প্রশিক্ষণ, নিরাপদ মাঠ ও প্রতিভা বাছাইয়ের উদ্যোগ তাদের সামনে নতুন পথ খুলতে পারে।', 'প্রদর্শিত লেখা ও ছবি প্রাথমিক ডেমো কনটেন্ট; যাচাইকৃত মাঠ-প্রতিবেদন দিয়ে এটি পরবর্তীতে আপডেট হবে।']
  },
  {
    slug: 'sixty-four-district-reporting-network',
    category: 'সারাদেশ', categoryEn: 'Nationwide', district: '৬৪ জেলা',
    title: '৬৪ জেলার খবর এক ঠিকানায় আনার প্রস্তুতি',
    titleEn: 'Preparing to bring news from all 64 districts to one place',
    excerpt: 'জেলা ও উপজেলা প্রতিনিধিদের যাচাইকৃত তথ্য দিয়ে গড়ে উঠবে সারাদেশের সংবাদ আর্কাইভ।',
    excerptEn: 'Verified reports from district and subdistrict correspondents will build a national archive.',
    image: '/images/rural-bangladesh-small.webp', publishedAt: '2026-08-31T14:00:00+06:00', updatedAt: '2026-09-01T08:45:00+06:00', author: 'জাতীয় ডেস্ক',
    content: ['প্রতিটি জেলার গুরুত্বপূর্ণ খবর, সমস্যা, সম্ভাবনা ও মানুষের কথা একই ডিজিটাল আর্কাইভে রাখার লক্ষ্য নিয়ে এই বিভাগ তৈরি হয়েছে। জেলা, ক্যাটাগরি ও প্রকাশের তারিখ অনুযায়ী প্রতিবেদন খুঁজে পাওয়া যাবে।', 'প্রতিনিধি নেটওয়ার্ক চূড়ান্ত হওয়ার পর প্রতিটি সংবাদ যাচাই ও সম্পাদনার ধাপ অতিক্রম করে প্রকাশিত হবে।']
  },
  {
    slug: 'local-business-digital-opportunity',
    category: 'প্রযুক্তি', categoryEn: 'Technology', district: 'ঢাকা',
    title: 'ডিজিটাল প্ল্যাটফর্মে স্থানীয় ব্যবসার নতুন সম্ভাবনা',
    titleEn: 'New opportunities for local businesses on digital platforms',
    excerpt: 'অনলাইন পরিচিতি, ডিজিটাল লেনদেন ও স্থানীয় ডেলিভারি ছোট ব্যবসাকে নতুন ক্রেতার কাছে পৌঁছে দিচ্ছে।',
    excerptEn: 'Online presence, payments and local delivery are helping small businesses reach new customers.',
    image: '/images/rural-market-small.webp', publishedAt: '2026-08-30T11:30:00+06:00', updatedAt: '2026-08-30T15:00:00+06:00', author: 'প্রযুক্তি ডেস্ক',
    content: ['ডিজিটাল সেবা এখন শুধু বড় শহরে সীমাবদ্ধ নয়। স্থানীয় ব্যবসার নির্ভরযোগ্য অনলাইন পরিচিতি ও দ্রুত যোগাযোগ ব্যবস্থা তৈরি হলে ক্রেতা ও বিক্রেতার দূরত্ব কমে আসে।', 'এটি ওয়েবসাইটের নমুনা কনটেন্ট এবং প্রকাশযোগ্য সংবাদ নয়।']
  },
  {
    slug: 'climate-resilient-village-planning',
    category: 'পরিবেশ', categoryEn: 'Environment', district: 'সুনামগঞ্জ',
    title: 'জলবায়ু সহনশীল গ্রাম পরিকল্পনায় স্থানীয় জ্ঞানকে গুরুত্ব',
    titleEn: 'Local knowledge matters in climate-resilient village planning',
    excerpt: 'হাওর, নদী ও উপকূলের ভিন্ন বাস্তবতা বিবেচনায় নিয়ে উন্নয়ন পরিকল্পনা করার আহ্বান বিশেষজ্ঞদের।',
    excerptEn: 'Planning must reflect the different realities of wetlands, rivers and coastal communities.',
    image: '/images/river-weather-small.webp', publishedAt: '2026-08-29T09:45:00+06:00', updatedAt: '2026-08-29T13:10:00+06:00', author: 'পরিবেশ ডেস্ক', rural: true,
    content: ['এক এলাকার সমাধান অন্য এলাকায় সমানভাবে কার্যকর নাও হতে পারে। স্থানীয় মানুষের অভিজ্ঞতা ও ভূপ্রকৃতিকে গুরুত্ব দিয়ে পরিকল্পনা করলে অবকাঠামো দীর্ঘস্থায়ী হয়।', 'এটি নমুনা বিশ্লেষণ; বাস্তব প্রকাশনায় বিশেষজ্ঞ মতামত ও উৎসের লিংক যুক্ত হবে।']
  },
  {
    slug: 'community-sports-healthy-youth',
    category: 'খেলাধুলা', categoryEn: 'Sports', district: 'রাজশাহী',
    title: 'কমিউনিটি খেলাধুলায় সুস্থ ও আত্মবিশ্বাসী তরুণ প্রজন্ম',
    titleEn: 'Community sports can build a healthy, confident generation',
    excerpt: 'স্কুল ও ইউনিয়ন পর্যায়ে নিয়মিত প্রতিযোগিতা কিশোরদের শারীরিক ও সামাজিক বিকাশে ভূমিকা রাখে।',
    excerptEn: 'Regular school and union-level competitions support physical and social development.',
    image: '/images/rural-football-small.webp', publishedAt: '2026-08-28T17:15:00+06:00', updatedAt: '2026-08-28T19:20:00+06:00', author: 'ক্রীড়া ডেস্ক',
    content: ['নিয়মিত খেলাধুলা শুধু প্রতিযোগিতা নয়, শৃঙ্খলা, দলগত কাজ ও আত্মবিশ্বাস তৈরিতেও ভূমিকা রাখে। স্থানীয় আয়োজনগুলো নিরাপদ ও অন্তর্ভুক্তিমূলক হলে আরও বেশি তরুণ যুক্ত হতে পারে।', 'এটি প্রাথমিক নমুনা প্রতিবেদন।']
  },
  {
    slug: 'public-services-district-access',
    category: 'জাতীয়', categoryEn: 'National', district: 'বাংলাদেশ',
    title: 'জেলা পর্যায়ে জনসেবা সহজ করতে সমন্বিত তথ্যের প্রয়োজন',
    titleEn: 'Integrated information can make district public services easier to access',
    excerpt: 'সেবার সময়, প্রয়োজনীয় কাগজপত্র ও অভিযোগের পথ এক জায়গায় থাকলে মানুষের ভোগান্তি কমতে পারে।',
    excerptEn: 'Clear service times, document lists and complaint channels can reduce public hardship.',
    image: '/images/rural-bangladesh-small.webp', publishedAt: '2026-08-28T10:15:00+06:00', updatedAt: '2026-08-28T12:20:00+06:00', author: 'জাতীয় ডেস্ক',
    content: ['সরকারি সেবা কোথায়, কখন এবং কীভাবে পাওয়া যাবে—এই তথ্য সহজ ভাষায় প্রকাশ করা হলে নাগরিকদের সময় ও ব্যয় কমে। জেলা ও উপজেলা পর্যায়ের তথ্য নিয়মিত হালনাগাদ রাখাও জরুরি।', 'এটি কাঠামো প্রদর্শনের জন্য রাখা নমুনা প্রতিবেদন।']
  },
  {
    slug: 'local-democracy-public-participation',
    category: 'রাজনীতি', categoryEn: 'Politics', district: 'সারাদেশ',
    title: 'স্থানীয় সিদ্ধান্তে নাগরিক অংশগ্রহণ বাড়ানোর সুযোগ',
    titleEn: 'Opportunities to increase citizen participation in local decisions',
    excerpt: 'উন্মুক্ত সভা, তথ্য প্রকাশ ও জবাবদিহি স্থানীয় গণতান্ত্রিক প্রক্রিয়াকে আরও কার্যকর করতে পারে।',
    excerptEn: 'Open meetings, public information and accountability can strengthen local democracy.',
    image: '/images/rural-market-small.webp', publishedAt: '2026-08-27T14:00:00+06:00', updatedAt: '2026-08-27T16:10:00+06:00', author: 'রাজনীতি ডেস্ক',
    content: ['স্থানীয় উন্নয়ন পরিকল্পনায় নাগরিকদের মতামত নেওয়া এবং সিদ্ধান্তের তথ্য প্রকাশ করা হলে আস্থা বাড়ে। সংবাদমাধ্যমের দায়িত্ব হচ্ছে দলীয় প্রচারণার বাইরে জনস্বার্থের প্রশ্নগুলো স্পষ্টভাবে তুলে ধরা।', 'এটি কোনো চলমান রাজনৈতিক ঘটনার প্রতিবেদন নয়; সাইটের নমুনা কনটেন্ট।']
  },
  {
    slug: 'south-asia-rural-climate-cooperation',
    category: 'আন্তর্জাতিক', categoryEn: 'International', district: 'দক্ষিণ এশিয়া',
    title: 'জলবায়ু ঝুঁকিতে দক্ষিণ এশিয়ার গ্রামীণ জনগোষ্ঠীর অভিন্ন চ্যালেঞ্জ',
    titleEn: 'South Asian rural communities share common climate challenges',
    excerpt: 'সীমান্ত অতিক্রম করা নদী, আবহাওয়া ও কৃষির তথ্য বিনিময় আঞ্চলিক প্রস্তুতিকে শক্তিশালী করতে পারে।',
    excerptEn: 'Sharing river, weather and agriculture data can strengthen regional preparedness.',
    image: '/images/river-weather-small.webp', publishedAt: '2026-08-26T12:00:00+06:00', updatedAt: '2026-08-26T13:25:00+06:00', author: 'আন্তর্জাতিক ডেস্ক',
    content: ['দক্ষিণ এশিয়ার বহু মানুষের জীবন নদী, কৃষি ও মৌসুমি আবহাওয়ার ওপর নির্ভরশীল। তথ্য বিনিময় ও স্থানীয় অভিজ্ঞতা থেকে শেখা দুর্যোগ প্রস্তুতিতে কার্যকর ভূমিকা রাখতে পারে।', 'এটি একটি নমুনা বিশ্লেষণ।']
  },
  {
    slug: 'folk-culture-digital-archive',
    category: 'বিনোদন', categoryEn: 'Entertainment', district: 'সারাদেশ',
    title: 'লোকসংস্কৃতির গান ও গল্প নিয়ে ডিজিটাল আর্কাইভের সম্ভাবনা',
    titleEn: 'A digital archive can preserve folk songs and stories',
    excerpt: 'স্থানীয় শিল্পী ও প্রবীণদের অংশগ্রহণে হারিয়ে যাওয়া সাংস্কৃতিক উপাদান সংরক্ষণ করা সম্ভব।',
    excerptEn: 'Local artists and elders can help preserve cultural traditions at risk of disappearing.',
    image: '/images/rural-bangladesh-small.webp', publishedAt: '2026-08-25T17:30:00+06:00', updatedAt: '2026-08-25T18:40:00+06:00', author: 'বিনোদন ডেস্ক',
    content: ['বাংলাদেশের প্রতিটি অঞ্চলের গান, গল্প, উৎসব ও অভিনয়ের নিজস্ব ধারা রয়েছে। শিল্পীর সম্মতি, সঠিক পরিচিতি ও উৎস উল্লেখ করে ডিজিটালভাবে সংরক্ষণ করলে নতুন প্রজন্ম এগুলো জানতে পারে।', 'এটি প্রাথমিক নমুনা ফিচার।']
  },
  {
    slug: 'rural-reporting-public-interest',
    category: 'মতামত', categoryEn: 'Opinion', district: 'সম্পাদকীয়',
    title: 'কেন গ্রাম পর্যায়ের সাংবাদিকতা জনস্বার্থের জন্য গুরুত্বপূর্ণ',
    titleEn: 'Why village-level journalism matters for the public interest',
    excerpt: 'জাতীয় আলোচনার বাইরে থাকা মানুষের অভিজ্ঞতা তুলে ধরলে উন্নয়ন ও জবাবদিহির বাস্তব চিত্র পাওয়া যায়।',
    excerptEn: 'Reporting overlooked experiences gives a clearer picture of development and accountability.',
    image: '/images/rural-market-small.webp', publishedAt: '2026-08-24T09:30:00+06:00', updatedAt: '2026-08-24T11:00:00+06:00', author: 'সম্পাদকীয় বিভাগ',
    content: ['সংবাদ শুধু বড় শহর বা কেন্দ্রীয় প্রতিষ্ঠানের ঘটনাকে ঘিরে নয়। গ্রামে শিক্ষা, স্বাস্থ্য, যোগাযোগ, কৃষি ও পরিবেশের পরিবর্তন দেশের সামগ্রিক অবস্থাকে প্রভাবিত করে।', 'মতামতধর্মী লেখা সংবাদ থেকে আলাদাভাবে চিহ্নিত রাখা হবে।']
  }
];

export const categories = ['জাতীয়', 'রাজনীতি', 'অর্থনীতি', 'সারাদেশ', 'গ্রামবাংলা', 'আন্তর্জাতিক', 'খেলাধুলা', 'বিনোদন', 'প্রযুক্তি', 'পরিবেশ', 'আবহাওয়া', 'মতামত'];
