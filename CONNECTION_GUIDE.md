# সংযোগ গাইড — কোন ফাইল কোন সফটওয়্যার/সার্ভিসের সাথে যুক্ত হবে

আপনার হাতে যে টুলগুলো আছে (Python, Netlify, GitHub, Firebase) — প্রতিটার জন্য এই প্যাকেজের
ঠিক কোন ফাইলটা লাগবে এবং কীভাবে যুক্ত করবেন, নিচে একে একে বাংলায় দেওয়া হলো।

---

## ১) 🔥 Firebase — লাইভ ডেটা সিঙ্ক (Auth + Database + File Storage)
**যে ফাইল লাগবে:** `index.html` (এর ভেতরেই `firebaseConfig` অংশ আছে) + `firestore.rules` + `storage.rules`

**সংযোগ ধাপ:**
1. https://console.firebase.google.com → নতুন প্রজেক্ট বানান (ফ্রি Spark Plan)
2. Authentication → Email/Password চালু করুন
3. Firestore Database → Create database
4. Storage → Get started
5. Project settings → Your apps → Web app যোগ করে `firebaseConfig` কপি করুন
6. `index.html` ফাইলটা যেকোনো টেক্সট এডিটরে (Notepad/VS Code) খুলুন → `PASTE_YOUR` লিখে সার্চ করুন → ৬টা মান বসান
7. `firestore.rules`-এর ভেতরের লেখা কপি করে Firebase Console → Firestore → Rules ট্যাবে পেস্ট করে Publish করুন
8. `storage.rules`-এর লেখা কপি করে Firebase Console → Storage → Rules ট্যাবে পেস্ট করে Publish করুন

**ফলাফল:** সব ইউজারের সাইনআপ/লগইন, কাজের আপডেট, ফাইল আপলোড — সব ডিভাইসে রিয়েল-টাইম সিঙ্ক হবে।

---

## ২) 🌐 Netlify — এক-ক্লিকে ফ্রি পাবলিক লিংক (হোস্টিং)
**যে ফাইল/ফোল্ডার লাগবে:** পুরো `RIZVIWORLD_ROOT_INDEX` ফোল্ডার (ভেতরে `index.html` থাকতে হবে রুটে)

**সংযোগ ধাপ (কোনো একাউন্ট ছাড়াই সবচেয়ে সহজ পদ্ধতি):**
1. https://app.netlify.com/drop এ যান
2. `RIZVIWORLD_ROOT_INDEX` ফোল্ডারটা মাউস দিয়ে ধরে ব্রাউজারে ছেড়ে দিন (drag & drop)
3. কয়েক সেকেন্ডে একটা লিংক পাবেন যেমন `https://your-site-name.netlify.app`
4. এই লিংকটাই এখন আপনার লাইভ ডেমো — ল্যাপটপ, মোবাইল, TV ব্রাউজার সব জায়গা থেকে খোলা যাবে

**একাউন্ট দিয়ে করলে (স্থায়ী, GitHub-এর সাথে auto-deploy):** Netlify → "Add new site" → "Import from GitHub" → ধাপ ৩-এর GitHub repo সিলেক্ট করুন → Publish directory ঘরে `RIZVIWORLD_ROOT_INDEX` লিখুন → Deploy।

---

## ৩) 🐙 GitHub — কোড সংরক্ষণ + বিনামূল্যে GitHub Pages হোস্টিং
**যে ফাইল লাগবে:** পুরো ফোল্ডার + `.gitignore` (ইতিমধ্যে দেওয়া আছে)

**সংযোগ ধাপ:**
1. github.com এ লগইন করে **New repository** বানান (নাম যেকোনো, README/gitignore ছাড়া খালি রাখুন)
2. `RIZVIWORLD_ROOT_INDEX` ফোল্ডারে টার্মিনাল/CMD খুলে:
```
git init
git add .
git commit -m "RIZVIWORLD first upload"
git branch -M main
git remote add origin https://github.com/<আপনার-ইউজারনেম>/<repo-name>.git
git push -u origin main
```
3. GitHub repo পেজে **Settings → Pages → Branch: main / root → Save**
4. কিছুক্ষণ পর `https://<ইউজারনেম>.github.io/<repo-name>/` লিংকে লাইভ পাবেন

---

## ৪) 🐍 Python (pip / venv) — Django + PostgreSQL ব্যাকএন্ড (ঐচ্ছিক, পরের ধাপ)
**যে ফাইল/ফোল্ডার লাগবে:** `backend_django/` (ভেতরে `backend_django/README.md`-এ বিস্তারিত ধাপ আছে)

**সংক্ষেপে সংযোগ ধাপ:**
```
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install django djangorestframework psycopg2-binary

django-admin startproject rmg_erp
cd rmg_erp
cp -r ../backend_django/rizviworld apps/rizviworld     # apps/ ফোল্ডার আগে বানিয়ে নিন
```
তারপর `settings.py`-তে:
```python
INSTALLED_APPS += ["rest_framework", "apps.rizviworld"]
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "rizviworld_db",
        "USER": "postgres",
        "PASSWORD": "<আপনার PostgreSQL পাসওয়ার্ড>",
        "HOST": "localhost",
        "PORT": "5432",
    }
}
```
তারপর:
```
python manage.py makemigrations rizviworld
python manage.py migrate
python manage.py seed_rizviworld
python manage.py runserver
```
এই ব্যাকএন্ডটা `index.html`-এর সাথে সরাসরি যুক্ত না — এটা ভবিষ্যতে Firebase-এর পাশাপাশি বা
বদলে প্রতিষ্ঠানের নিজস্ব সার্ভারে হোস্ট করতে চাইলে দ্বিতীয় ধাপ হিসেবে ব্যবহার করবেন।

---

## সংযোগের সারসংক্ষেপ (এক নজরে)

| আপনার টুল | কোন ফাইল লাগবে | কী পাবেন |
|---|---|---|
| Firebase | `index.html` + `firestore.rules` + `storage.rules` | Login, Live Sync, File Upload |
| Netlify | পুরো `RIZVIWORLD_ROOT_INDEX/` ফোল্ডার | ফ্রি পাবলিক লিংক (হোস্টিং) |
| GitHub | পুরো ফোল্ডার + `.gitignore` | কোড সংরক্ষণ + GitHub Pages হোস্টিং |
| Python/pip | `backend_django/` ফোল্ডার | PostgreSQL-যুক্ত নিজস্ব সার্ভার (ঐচ্ছিক) |

**পরামর্শ:** প্রথমে Firebase কনফিগার করুন (ধাপ ১) — এটাই সবচেয়ে গুরুত্বপূর্ণ, কারণ এটা ছাড়া লাইভ সিঙ্ক
কাজ করবে না। এরপর Netlify Drop (ধাপ ২) দিয়ে ৩০ সেকেন্ডে একটা পাবলিক লিংক নিয়ে নিন। GitHub ও Python
ব্যাকএন্ড পরে সময়মতো যুক্ত করলেই চলবে।

---

## 🔐 SHA-256 চেকসাম নিয়ে একটা কথা
আপনি একটা SHA-256 হ্যাশ পাঠিয়েছেন:
```
712f688006f1f27ad03369aea4d7b68dbcc3e07a3749fe3415aa6570ea71a608
```
সততার সাথে বলছি — এই নির্দিষ্ট হ্যাশ নম্বরটা আমি নিজে থেকে কোনো ফাইলে "বসাতে" বা "মিলিয়ে" দিতে পারবো না।
SHA-256 একটা one-way ক্রিপ্টোগ্রাফিক ফাংশন — ফাইলের কনটেন্ট থেকে হ্যাশ বের হয়, কিন্তু কোনো নির্দিষ্ট
হ্যাশ ধরে সেই হ্যাশ দেবে এমন ফাইল বানানো (reverse করা) গাণিতিকভাবে অসম্ভব — এটা পৃথিবীর কোনো সফটওয়্যারই
করতে পারে না, এমনকি Google-ও না। এই হ্যাশটা হয়তো অন্য কোনো ফাইল/টুল থেকে এসেছে, এই প্যাকেজের সাথে এর
কোনো সম্পর্ক নেই।

তবে যেটা করে দিলাম — এই ZIP ফাইলের **আসল** SHA-256 চেকসাম একটা আলাদা `.sha256.txt` ফাইলে
(ZIP-এর পাশে, ভেতরে না — কারণ ভেতরে রাখলে হ্যাশ নিজেই বদলে যেত) দিয়ে দিয়েছি এবং চ্যাটেও নিচে লিখে
দিচ্ছি, যাতে আপনি চাইলে ভবিষ্যতে ফাইলটা অপরিবর্তিত (untampered) আছে কিনা যাচাই করতে পারেন —
```
sha256sum RIZVIWORLD_ROOT_INDEX.zip     # Linux/Mac
certutil -hashfile RIZVIWORLD_ROOT_INDEX.zip SHA256   # Windows
```
কমান্ড চালিয়ে `CHECKSUM.txt`-এর মানের সাথে মিলিয়ে দেখতে পারবেন।
