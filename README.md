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
  # RIZVI HR ERP PRODUCTION V1 — ROOT INDEX

Source basis: the exact module-wise database structure supplied by the user.

- 13 modules
- 295 named tables supplied
- Customisation/settings registry 1–295
- PK/FK/index-ready architecture
- Payroll and attendance partitioning extension points
- Audit archive extension point
- Reporting views and stored-procedure extension points
- API-ready structure

The source says “300+ Tables Architecture” while explicitly naming 295 tables. This package
preserves the 295 supplied names and does not invent five undocumented business tables.
# 02_HR_ADMINISTRATION

1. `employee_master`
2. `employee_personal_info`
3. `employee_address`
4. `employee_family`
5. `employee_documents`
6. `employee_bank`
7. `employee_nominee`
8. `employee_history`
9. `employee_transfer`
10. `employee_promotion`
11. `employee_increment`
12. `employee_resignation`
13. `employee_clearance`
14. `employee_exit_interview`
15. `recruitment_request`
16. `job_posting`
17. `applicant_master`
18. `interview_schedule`
19. `candidate_evaluation`
20. `onboarding`
21. `probation_management`
22. `confirmation`
23. `training_master`
24. `training_schedule`
25. `training_participant`
26. `competency_master`
27. `KPI_master`
28. `performance_review`
29. `appraisal_cycle`
30. `IDP_plan`
31. `succession_plan`
32. `talent_matrix_9box`
33. `manpower_budget`
34. `organization_chart`
35. `employee_skill_matrix`
36. `disciplinary_action`
37. `grievance_management`
38. `welfare_activity`
39. `employee_feedback`
40. `HR_dashboard`
# RIZVI পাঞ্চ ব্রিজ — সেটআপ গাইড

## এটা কী করে
ফ্যাক্টরির যে PC পাঞ্চ মেশিনের সাথে একই নেটওয়ার্কে আছে, সেই PC-তে এই স্ক্রিপ্ট চালাবেন।
এটা মেশিনের ডাটা লোকালি গ্রহণ করে ইন্টারনেট দিয়ে (আউটবাউন্ড — এর জন্য firewall-এ কিছু
খুলতে হবে না) সরাসরি Firestore-এ পাঠিয়ে দেয়।

## ধাপ ১ — Firebase Service Account key ডাউনলোড
1. https://console.firebase.google.com → আপনার প্রজেক্ট → ⚙️ **Project settings**
2. **Service accounts** ট্যাব → **Generate new private key**
3. যে ফাইলটা ডাউনলোড হবে, সেটার নাম বদলে `serviceAccountKey.json` রাখুন
4. এই ফোল্ডারে (`bridge.js`-এর পাশে) কপি করুন

⚠️ এই ফাইলটা কখনো কারো সাথে শেয়ার করবেন না, GitHub-এ পাবলিকভাবে আপলোড করবেন না —
এটা দিয়ে যে কেউ আপনার পুরো ডাটাবেসে full access পেয়ে যাবে (Firestore rules bypass করেই)।

## ধাপ ২ — ইনস্টল ও রান
```
npm install
node bridge.js
```
সফল হলে দেখাবে:
```
✅ TCP bridge শুনছে port 7700-এ
✅ HTTP fallback শুনছে port 7701-এ
```

## ধাপ ৩ — মেশিনের কনফিগারেশনে এই PC-র IP বসানো
আপনার পাঞ্চ মেশিন সফটওয়্যারে (যেটা এখন CSV এক্সপোর্ট করছে) "Push/Server IP" বা
"ADMS Server" সেটিংসে গিয়ে এই PC-র লোকাল IP (যেমন `192.168.1.50`) আর পোর্ট `7700` বসান।

## ⚠️ সততার সাথে একটা জরুরি কথা
এই bridge-এর parser আপনার **CSV এক্সপোর্ট ফরম্যাট** (Employee Id, Access Control Id,
Employee Name, Machine Ip, Log Date, Log Hour, Log Min, Log Sec) অনুযায়ী বানানো —
কিন্তু মেশিনটা **live সংযোগে ঠিক কোন ফরম্যাটে ডাটা পাঠায়** তা যাচাই করার কোনো উপায়
আমার কাছে নেই (আসল মেশিন হাতে নেই, sandbox-এ network বন্ধ)। তাই:

1. প্রথমবার চালানোর পর মেশিন থেকে ডাটা এলে টার্মিনালে/`logs/unparsed.log`-এ দেখুন
2. যদি "চেনা ফরম্যাট না" লেখা আসে, `logs/unparsed.log`-এর ২-৩ লাইন আমাকে কপি করে পাঠান
3. আমি সাথে সাথে parser-টা ঠিক সেই ফরম্যাট অনুযায়ী ঠিক করে দেব

এটাই একমাত্র বাস্তবসম্মত উপায় — আসল হার্ডওয়্যার ছাড়া "১০০% নিশ্চিত" পার্সার লেখা কারো
পক্ষেই সম্ভব না, প্রথম live টেস্টের ফলাফল লাগবেই।

## এই PC সবসময় চালু রাখা
Windows-এ বন্ধ হয়ে গেলে ডাটা আসা বন্ধ হয়ে যাবে। এটা ২৪/৭ চালু রাখতে:
- Task Scheduler দিয়ে PC চালু হলেই `node bridge.js` অটো-স্টার্ট করান, অথবা
- `pm2` ব্যবহার করুন: `npm install -g pm2` তারপর `pm2 start bridge.js` `pm2 save`



