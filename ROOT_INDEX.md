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

