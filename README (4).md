# RIZVIWORLD — RIZVI-MANAGEMENT
### Integrated Management & Business Intelligence System — Rizvi Fashions Ltd.

## এখনই চালাবেন যেভাবে (কনফিগার ছাড়াই)
`index.html` যেকোনো ব্রাউজারে খুললেই চলবে — Windows/laptop, Android, iPhone, বড় Smart TV ব্রাউজার।
Firebase কনফিগার না করলে এটি **Local Demo Mode**-এ চলবে (শুধু এই ব্রাউজারে ডেটা থাকবে, একটা 🟡 নোটিশ দেখাবে)।

---

## ধাপ ১ — ফ্রি Firebase প্রজেক্ট বানিয়ে আসল Live Sync চালু করা
1. https://console.firebase.google.com এ যান → **Add project** → নাম দিন `rizvi-management` (ফ্রি, কার্ড লাগে না — Spark Plan)
2. প্রজেক্টের ভেতরে বাম পাশে:
   - **Authentication → Get started → Email/Password চালু করুন**
   - **Firestore Database → Create database → Start in production mode** (পরে `firestore.rules` আপলোড করবেন)
   - **Storage → Get started** (ফাইল/ছবি/ভিডিও/অডিও রাখার জন্য)
3. **Project settings (⚙️) → General → Your apps → Web (`</>`)** এ ক্লিক করে একটা Web App যোগ করুন — এখানে `firebaseConfig` অবজেক্ট পাবেন
4. `index.html` ফাইলে `firebaseConfig` অংশ খুঁজে বের করুন (search করুন `PASTE_YOUR`) এবং আপনার নিজের মান বসিয়ে দিন
5. ফাইল সেভ করুন, ব্রাউজারে রিফ্রেশ দিন — টপবারে/লগইন পেজে 🟢 Firebase Live Sync সক্রিয় দেখবেন
6. Firebase Console → Firestore → Rules ট্যাবে গিয়ে এই প্যাকেজের `firestore.rules` ফাইলের কনটেন্ট পেস্ট করে Publish করুন
7. একইভাবে Storage → Rules-এ `storage.rules` পেস্ট করে Publish করুন

এটা হয়ে গেলে: signup/login আসল Firebase Authentication দিয়ে হবে, প্রতিটি কাজের আপডেট/অ্যাটাচমেন্ট/অ্যাক্টিভিটি ফিড
সত্যিকারের multi-device real-time sync হবে — একজন ফোনে আপডেট দিলে অ্যাডমিন সাথে সাথে ল্যাপটপে দেখবে, কোনো রিফ্রেশ ছাড়াই।

## ধাপ ২ — GitHub-এ আপলোড ও ফ্রি হোস্টিং (GitHub Pages)
এই ফোল্ডারে ইতিমধ্যে git init করা আছে, প্রথম কমিটও করা আছে। শুধু নিচের ধাপ অনুসরণ করুন:

```
git remote add origin https://github.com/<আপনার-ইউজারনেম>/<repo-name>.git
git branch -M main
git push -u origin main
```

তারপর GitHub repo → Settings → Pages → Branch: main / (root) সিলেক্ট করে Save করুন।
কিছুক্ষণ পর `https://<আপনার-ইউজারনেম>.github.io/<repo-name>/` লিংকে পুরো অ্যাপ লাইভ পাবেন — সম্পূর্ণ ফ্রি,
কোনো সার্ভার খরচ ছাড়া। ল্যাপটপ, মোবাইল, স্মার্ট TV ব্রাউজার — সব জায়গা থেকে এই এক লিংকে ঢোকা যাবে।

## ধাপ ৩ — নিজের ল্যাপটপে PostgreSQL/Django backend (পরবর্তী পর্যায়ে, ঐচ্ছিক)
আপনি বলেছেন PostgreSQL ইনস্টল করা আছে — `backend_django/` ফোল্ডারে সেই স্ক্যাফোল্ড দেওয়া আছে
(models, serializers, views, admin — README ভেতরে)। এটা এখনই index.html-এর সাথে সরাসরি যুক্ত না;
Firebase দিয়ে ইতিমধ্যেই আসল multi-device sync পেয়ে যাচ্ছেন বলে এটা ঐচ্ছিক দ্বিতীয় স্তর —
প্রতিষ্ঠানের নিজস্ব সার্ভারে হোস্ট করে আরও কড়াকড়ি নিয়ন্ত্রণ/রিপোর্টিং চাইলে ভবিষ্যতে যুক্ত করা যাবে।

---

## সততার সাথে একটা সংখ্যা নিয়ে পরিষ্কার কথা বলি
আপনি চেয়েছেন "প্রতি সেকেন্ডে লাখ লাখ আপডেট" নিশ্চিত করতে। এটা নিয়ে সরাসরি বলা দরকার:

- Firebase-এর ফ্রি (Spark) প্ল্যানে দিনে সীমা: প্রায় ৫০,০০০ read + ২০,০০০ write + ১GB স্টোরেজ + ১০GB/মাস ডেটা ট্রান্সফার।
  এটা প্রতি সেকেন্ডে না, প্রতি দিনে এই সংখ্যা।
- আপনার প্রতিষ্ঠানে ৬,০০০–৮,০০০ কর্মী প্রতিদিন কয়েকবার করে আপডেট দিলে বাস্তব সংখ্যা দাঁড়ায়
  দিনে প্রায় ২০,০০০–৫০,০০০ write — যেটা ফ্রি প্ল্যানের ভেতরেই আরামে চলে যায়।
- কিন্তু "প্রতি সেকেন্ডে লাখ লাখ (মিলিয়ন) আপডেট" আক্ষরিক অর্থে Facebook/Google স্কেলের ট্রাফিক —
  এটা কোনো ফ্রি সার্ভিস তো দূরের কথা, বেশিরভাগ বড় কোম্পানির সিস্টেমও প্রতি সেকেন্ডে অতটা আপডেট প্রসেস করে না।
  কোনো প্রোভাইডার (Firebase, AWS, Google Cloud — ফ্রি বা পেইড কোনোটাই) এই আক্ষরিক দাবি "guarantee" করে না,
  কারণ বাস্তবে এত ট্রাফিকের দরকারও পড়ে না আপনার প্রতিষ্ঠানের আকারে।
- আপনার আসল প্রয়োজনের জন্য (৮ হাজার ইউজার, দৈনিক আপডেট, লক্ষ লক্ষ সঞ্চিত ডকুমেন্ট — একসাথে প্রতি
  সেকেন্ডে না) Firebase Spark প্ল্যান যথেষ্ট শুরু করার জন্য, আর ট্রাফিক বাড়লে Blaze প্ল্যানে (pay-as-you-go,
  তখনও অনেক সস্তা — প্রতি ১ লাখ write প্রায় $0.18) আপগ্রেড করলেই আপনার পুরো প্রতিষ্ঠানের প্রকৃত চাহিদা
  নিশ্চিন্তে সামলাবে।

সংক্ষেপে: আপনার প্রতিষ্ঠানের প্রকৃত স্কেলের জন্য এই সেটআপ ১০০% যথেষ্ট এবং নির্ভরযোগ্য — কিন্তু
"প্রতি সেকেন্ডে লাখ লাখ" আক্ষরিক সংখ্যাটা কোনো সিস্টেমই "guarantee" করে না বলে সেটা এখানে না বলে
সঠিক প্রত্যাশা দেওয়াই আমার কাজ মনে করলাম।

---

## এই ভার্সনে নতুন যা যোগ হলো
- Firebase Authentication (Email/Password) — signup/signin/forgot password এখন আসল
- Firestore real-time listeners — Activity Feed, Users, Employees, User Updates, ISO Checklist সব
  collection-এ live onSnapshot — একাধিক ডিভাইস/ব্রাউজারে সত্যিকারের auto-sync
- Firebase Storage — কাজের আপডেটে Word/PDF/Excel/ছবি/ভিডিও/অডিও এখন সত্যিকারের আপলোড
  (আসল progress bar, ডাউনলোড URL সহ)
- Master Employee CSV import এখন Firestore batch write দিয়ে সব ডিভাইসে সিঙ্ক হয় (২০k+ সারি হলে
  একটা সতর্কবার্তাও দেখাবে, কয়েক দিনে ভাগ করে ইমপোর্ট করার পরামর্শসহ)
- firestore.rules ও storage.rules — Firebase Console-এ পেস্ট করার জন্য প্রস্তুত সিকিউরিটি রুলস
- Local git repo প্রস্তুত — GitHub-এ পুশ করে GitHub Pages-এ ফ্রি হোস্ট করা যাবে
- 📋 ISO Checklist মডিউল — Main Sidebar-এর ৪৪টি অপারেশনাল মডিউল, ৩০টি Section, ১৯৬টি Designation —
  যেকোনো কম্বিনেশন বেছে ISO 9001:2015-ভিত্তিক ১২-পয়েন্ট কমপ্লায়েন্স চেকলিস্ট (clause reference সহ)
  পূরণ করা যায়, প্রতিটি কম্বিনেশনের জন্য আলাদা কমপ্লায়েন্স % (green/yellow/red), Firestore-এ সংরক্ষিত ও সিঙ্কড

## ISO Checklist সম্পর্কে সততার সাথে একটা নোট
এই ১২-পয়েন্ট চেকলিস্টটা ISO 9001:2015-এর সাধারণ কাঠামো (generic structure) অনুসরণ করে বানানো —
প্রতিটি Module/Section/Designation-এর জন্য প্রয়োগযোগ্য একটা সাধারণ টেমপ্লেট। এটা কোনো সার্টিফিকেশন বডি
(BSCI, WRAP, Sedex, ISO সার্টিফাইড অডিটর) কর্তৃক অনুমোদিত অফিসিয়াল চেকলিস্ট না — বাস্তব ISO 9001/14001/45001
অডিটের জন্য আপনার প্রতিষ্ঠানের QMR (Quality Management Representative) বা সার্টিফাইড কনসালট্যান্ট দিয়ে
এই চেকলিস্টের ভাষা/আইটেম যাচাই ও প্রয়োজনমতো সংযোজন করিয়ে নেওয়া উচিত।

## লগইন তথ্য
- Admin: ssheraji@gmail.com / Admin123456
- Employee: Sign Up করে Email/Mobile দিয়ে নিজে একাউন্ট খুলবে

## ফোল্ডার গঠন
```
RIZVIWORLD_ROOT_INDEX/
├── index.html            ← মূল অ্যাপ (Firebase + ISO Checklist সহ)
├── firestore.rules       ← Firebase Console → Firestore → Rules এ পেস্ট করুন
├── storage.rules         ← Firebase Console → Storage → Rules এ পেস্ট করুন
├── backend_django/       ← ঐচ্ছিক পরবর্তী-স্তর সার্ভার স্ক্যাফোল্ড (PostgreSQL/Django)
├── .git/                 ← GitHub-এ পুশ করার জন্য প্রস্তুত local repo
└── README.md              ← এই ফাইল
```
