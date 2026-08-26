# RIZVITEAMS — GitHub + Firebase (সম্পূর্ণ ফ্রি) পাবলিশ গাইড

কোনো WebIntoApp বা base44 লাগবে না। শুধু **GitHub** (কোড হোস্টিং, ফ্রি) এবং **Firebase Hosting Spark plan** (ফ্রি — নিজের ডোমেইনে HTTPS সহ)।

---

## ধাপ ১ — GitHub-এ কোড আপলোড

তোমার কম্পিউটারে এই ফোল্ডার (`RIZVI_UNIFIED_APP`) রাখো, তারপর:

```bash
cd RIZVI_UNIFIED_APP
git init
git add .
git commit -m "RIZVITEAMS — initial publish"
```

GitHub-এ গিয়ে (github.com) একটা নতুন **empty repository** বানাও (নাম: `rizviteams`), README/gitignore টিক না দিয়ে। তারপর:

```bash
git branch -M main
git remote add origin https://github.com/<তোমার-ইউজারনেম>/rizviteams.git
git push -u origin main
```

---

## ধাপ ২ — Firebase প্রজেক্ট তৈরি (ফ্রি Spark Plan)

1. https://console.firebase.google.com -এ যাও, Google একাউন্ট দিয়ে লগইন করো।
2. তোমার প্রজেক্ট **`izviteam`** যদি আগে থেকেই তৈরি না থাকে, "Add Project" দিয়ে ঠিক এই নামে (বা যেকোনো নামে) একটা প্রজেক্ট বানাও।
3. বাম মেনু থেকে **Build → Authentication → Sign-in method** এ গিয়ে Email/Password enable করো।
4. **Build → Firestore Database → Create database** — Production mode-এ শুরু করো, নিকটতম region (asia-south1 বা asia-southeast1) বেছে নাও। এটা Spark (ফ্রি) plan-এই কাজ করে, কোনো বিলিং কার্ড লাগবে না।
5. **Build → Hosting → Get started** — এটা চালু করলেই Hosting ফ্রি হয়ে যাবে।

---

## ধাপ ৩ — নিজের কম্পিউটার থেকে প্রথমবার Deploy (Manual, সবচেয়ে সহজ)

```bash
npm install -g firebase-tools
firebase login
cd RIZVI_UNIFIED_APP
firebase deploy --only hosting,firestore:rules
```

Deploy শেষ হলে টার্মিনালে একটা লিংক দেখাবে, যেমন:
`https://izviteam.web.app`

এটাই তোমার লাইভ অ্যাপের লিংক — এখন থেকে যেকোনো ব্রাউজার/মোবাইল থেকে খোলা যাবে।

---

## ধাপ ৪ — GitHub থেকে অটো-ডিপ্লয় (ঐচ্ছিক, একবার সেটআপ করলে ভবিষ্যতে শুধু `git push` করলেই আপডেট হয়ে যাবে)

`.github/workflows/deploy.yml` ফাইলটা ইতিমধ্যে যুক্ত করা আছে। এটা কাজ করানোর জন্য:

1. টার্মিনালে চালাও: `firebase init hosting:github` — এটা তোমাকে GitHub-এ লগইন করাবে এবং প্রয়োজনীয় secret (`FIREBASE_SERVICE_ACCOUNT`) নিজে থেকেই GitHub repo settings-এ যুক্ত করে দেবে।
2. তারপর যেকোনো পরিবর্তনের পর শুধু:
   ```bash
   git add .
   git commit -m "update"
   git push
   ```
   করলেই কয়েক সেকেন্ডের মধ্যে Firebase-এ লাইভ আপডেট হয়ে যাবে।

---

## গুরুত্বপূর্ণ নিরাপত্তা নোট (যাওয়ার আগে অবশ্যই দেখো)

- **Admin/employee পাসওয়ার্ড কোডে কোথাও নেই** — শুধু email allowlist (`RIZVI_ADMIN_EMAILS`) আছে `rizvi-data.js`-এ। আসল পাসওয়ার্ড Firebase Console → Authentication → Users-এ সেট করতে হবে, লাইভ করার আগে অবশ্যই।
- **কখনো real password README/DEPLOY বা কোনো কোড ফাইলে লিখো না** — এই repo public, তাই কোড/ডকুমেন্টে যা লেখা থাকবে তা যে কেউ দেখতে পারবে।
- **Firestore Rules** (`firestore.rules`) এখন শুধু "signed-in হলেই সব read/write" — এটা শুরুর জন্য নিরাপদ ন্যূনতম, কিন্তু বেতন/ব্যাংক ডেটা পুরোপুরি live করার আগে role-based rules (admin vs employee, নিজের ডেটা ছাড়া অন্য কারো বেতন না দেখা) যোগ করা উচিত — এটা পরের ধাপে করে দিতে পারি।
- **ব্যাংক অ্যাকাউন্ট নাম্বার** ইতিমধ্যে অ্যাপে মাস্ক করা আছে (শেষ ৪ ডিজিট শুধু) — National ID/জন্ম নিবন্ধন এই ভার্সনে অ্যাপে আনা হয়নি, নিরাপত্তার জন্য।
