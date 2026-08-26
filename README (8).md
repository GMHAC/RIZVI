# RIZVIWORLD — RIZVI-MANAGEMENT
### Integrated Management & Business Intelligence System — Rizvi Fashions Ltd.

## এই ভার্সনে কী নতুন হলো
আগের ভার্সনটা ছিল single-device localStorage ডেমো। এই ভার্সনে `backend_django/` এখন
**সত্যিই চালানোর মতো একটা Django প্রজেক্ট** (আগে শুধু স্ক্যাফোল্ড ফাইল ছিল, `manage.py`/
`settings.py` ছিল না)। `index.html`-এ এখন একটা **sync layer** যুক্ত হয়েছে — যেই ডিভাইসই
সার্ভারের সাথে কানেক্টেড থাকুক (ল্যাপটপ, ফোন, ট্যাব, Smart TV browser), সবাই প্রতি
৩ সেকেন্ডে (adjustable) সার্ভার থেকে নতুন ডেটা পুল করে এবং সাথে সাথে স্ক্রিন আপডেট হয়।
সার্ভার না পাওয়া গেলে অ্যাপ চুপচাপ আগের মতো localStorage-only ডেমো মোডে fallback করে —
কিছু ভেঙে যায় না।

## চালানো — দুই ধাপ
```bash
cd backend_django
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser        # Django admin-এর জন্য (ঐচ্ছিক)
python manage.py seed_rizviworld        # 15 Department / 39 Section / 247 Designation লোড
python manage.py collectstatic --noinput
python run_server.py
```
এরপর ব্রাউজারে: `http://<এই-কম্পিউটারের-LAN-IP>:8000` — LAN IP সার্ভার চালু হলে
টার্মিনালেই দেখাবে। ফ্যাক্টরির যেকোনো ডিভাইস, একই WiFi/LAN-এ থাকলেই, এই ঠিকানায় গিয়ে
একই লাইভ ডেটা দেখতে পাবে।

## লগইন তথ্য (ডেমো — production-এ অবশ্যই পাল্টান)
**Admin Portal** — Email: `ssheraji@gmail.com` / Password: `Admin123456`
**Employee Portal** — Sign Up করে নতুন একাউন্ট (Email/Mobile), Forgot Password ডেমো

## সততার সাথে যা এখনো সীমাবদ্ধ (গুরুত্বপূর্ণ — না বললে আপনার ক্ষতি হবে)

**১. "প্রতি সেকেন্ডে লাখ লাখ আপডেট" বাস্তবসম্মত লক্ষ্য না।**
৭–৮ হাজার ইউজারের একটা ফ্যাক্টরি ERP-তে বাস্তব চাহিদা হলো: কেউ একটা এন্ট্রি দিলে
কয়েক সেকেন্ডের মধ্যে অন্য সবার স্ক্রিনে সেটা দেখা যাওয়া (near real-time) — এইটাই এখন
কাজ করছে (৩ সেকেন্ড পোলিং)। এটাকে আরও দ্রুত (sub-second, WebSocket-ভিত্তিক) করা সম্ভব,
কিন্তু "লাখ লাখ per second" সংখ্যাটা কোনো বাস্তব ERP-তে অর্থবহ লক্ষ্য না — কোনো ভেন্ডর
সততার সাথে এই সংখ্যা গ্যারান্টি দেবে না।

**২. আমি (Claude) নিজে থেকে ইন্টারনেটে হোস্ট/পাবলিশ করতে পারি না, URL দিতে পারি না।**
আমার sandbox-এ ইন্টারনেট বন্ধ, তাই আমি কোনো সার্ভারে deploy করে লাইভ লিংক তৈরি করতে
পারব না। এই ZIP-টা আপনাকে ডাউনলোড করে নিজে অথবা কারো মাধ্যমে হোস্ট করতে হবে —
নিচে ফ্রি অপশনগুলোর তুলনা ও ধাপে ধাপে গাইড দেওয়া আছে।

**৩. ফাইল আপলোড (Word/PDF/ছবি/ভিডিও/অডিও) এখন সার্ভারের `media/` ফোল্ডারে যায়** —
localStorage-এর কয়েক MB সীমা আর প্রযোজ্য না, কারণ এগুলো Django backend-এর
`EntryDocument`/`Feedback` মডেলে সেভ হয়। তবে *frontend-এর যে অংশগুলো এখনো সরাসরি
`db()/setDb()` ব্যবহার করে (ড্যাশবোর্ড, টাস্ক, একটিভিটি লগ)*, সেগুলো sync layer দিয়ে
কভার হয়ে গেছে; কিন্তু বাইনারি ফাইল আপলোডের UI অংশ (voice/video attach বাটন) এখনো
সরাসরি `/api/rizviworld/entries/` বা `/api/rizviworld/feedback/`-এ `FormData` দিয়ে
পাঠানোর কোড বাকি আছে — `backend_django/README.md`-এ উদাহরণ দেওয়া আছে।

## ফ্রি হোস্টিং অপশন — কোনটা কখন
| অপশন | উপযুক্ত কখন | সীমাবদ্ধতা |
|---|---|---|
| **শুধু LAN (এই run_server.py)** | ফ্যাক্টরির ভেতরেই সবাই কাজ করে, ইন্টারনেট দরকার নেই | বাইরে থেকে/অন্য শাখা থেকে access নেই |
| **Railway / Render (free tier)** | ইন্টারনেটে সহজে publish, PostgreSQL free দেয় | Free tier ঘুমিয়ে যায় (inactivity), ৭-৮ হাজার concurrent-এর জন্য paid plan লাগবেই |
| **PythonAnywhere (free tier)** | ছোট scale টেস্টের জন্য সহজ | কাস্টম ডোমেইন/স্কেল সীমিত |
| **Firebase** | এটা Django/Python হোস্ট করে না (Node/static/Firestore-কেন্দ্রিক) — এই প্রজেক্টের জন্য সরাসরি উপযুক্ত না | — |
| **GitHub Pages** | শুধু static ফাইল হোস্ট করে (index.html একা), Django backend চালাতে পারে না | backend আলাদা কোথাও লাগবে |
| **আপনার নিজের VPS/cloud server** (যেমন DigitalOcean/AWS, paid) | আসল production, ৭-৮ হাজার concurrent ইউজার, backup, security — সবচেয়ে বাস্তবসম্মত | খরচ আছে, but এইটা সৎ পরামর্শ |

**সংক্ষেপে বাস্তব পরামর্শ:** LAN দিয়ে এখনই factory-তে ব্যবহার শুরু করুন (কাজ করবে,
ফ্রি), আর যদি সত্যিই internet-wide ৭-৮ হাজার concurrent ইউজার + লাখ লাখ ডকুমেন্ট
চান — সেটার জন্য একটা ছোট paid VPS (মাসে ~$5-20) লাগবেই; কোনো "সম্পূর্ণ ফ্রি" অপশন
এই স্কেল সততার সাথে সামলাতে পারবে না।

## ফোল্ডার গঠন
```
RIZVIWORLD_ROOT_INDEX/
├── index.html                      ← ফ্রন্টএন্ড (এখন sync-সক্ষম)
├── backend_django/
│   ├── manage.py                   ← এখন standalone চালানো যায়
│   ├── run_server.py               ← LAN-এর জন্য Waitress সার্ভার
│   ├── requirements.txt
│   ├── rizviworld_site/            ← Django project (settings/urls/wsgi)
│   └── rizviworld/                 ← app (models/views/serializers/sync)
└── README.md                        ← এই ফাইল
```

## যাচাই করা হয়েছে (honest QA note)
- সব `.py` ফাইল সিনট্যাক্স-ভ্যালিড (`py_compile`)
- `index.html`-এর ইনলাইন JS সিনট্যাক্স-ভ্যালিড (`node --check`)
- HTML ট্যাগ ব্যালান্স ঠিক
- **যা টেস্ট করা যায়নি:** এই sandbox-এ ইন্টারনেট বন্ধ থাকায় `pip install` করে
  আসল সার্ভার চালিয়ে end-to-end (browser ↔ Django ↔ DB) টেস্ট করা সম্ভব হয়নি।
  কোড ম্যানুয়ালি রিভিউ করা হয়েছে, কিন্তু প্রথমবার চালানোর সময় কোনো ছোটখাটো এরর
  এলে আমাকে জানালে সাথে সাথে ঠিক করে দেব।
