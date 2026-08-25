# RIZVIWORLD — Django Backend Scaffold

এই ফোল্ডারটা `RIZVIWORLD_ROOT_INDEX.html` ফ্রন্টএন্ডকে localStorage থেকে সরিয়ে একটা রিয়েল,
মাল্টি-ইউজার, মাল্টি-ডিভাইস (ল্যাপটপ, মোবাইল, ট্যাব, স্মার্ট TV) লাইভ ডেটাবেজে যুক্ত করার জন্য।

## ১. ইনস্টল করুন
আপনার বিদ্যমান RMG_ERP Django প্রজেক্টে (`apps/rizviworld/` নামে) এই ফোল্ডারটা কপি করুন:

```bash
cp -r rizviworld  <your_django_project>/apps/rizviworld
pip install djangorestframework
```

`settings.py`-তে:
```python
INSTALLED_APPS += ["rest_framework", "apps.rizviworld"]
```

`urls.py` (প্রজেক্ট রুট):
```python
from django.urls import path, include
urlpatterns += [ path("api/rizviworld/", include("apps.rizviworld.urls")) ]
```

## ২. মাইগ্রেট ও সিড করুন
```bash
python manage.py makemigrations rizviworld
python manage.py migrate
python manage.py seed_rizviworld   # 15 Department / 39 Section / 247 Designation লোড করবে
```

## ৩. API এন্ডপয়েন্ট
| Method | Endpoint | কাজ |
|---|---|---|
| GET | `/api/rizviworld/departments/` | ১৫ ডিপার্টমেন্ট |
| GET | `/api/rizviworld/sections/` | ৩৯ সেকশন |
| GET | `/api/rizviworld/designations/` | ২৪৭ ডেজিগনেশন |
| GET/POST | `/api/rizviworld/entries/` | দৈনিক এন্ট্রি (target/achieved/note/voice/video) |
| GET | `/api/rizviworld/sections/{id}/evaluation/` | daily→yearly অটো-ইভালুয়েশন |
| GET | `/api/rizviworld/dashboard/` | মাস্টার ড্যাশবোর্ড + bubble chart ডেটা |
| GET/POST | `/api/rizviworld/announcements/` | ম্যানেজমেন্ট ঘোষণা |
| GET/POST | `/api/rizviworld/feedback/` | অভিজ্ঞতা/অভিযোগ/পরামর্শ |

Admin গ্রুপ/staff ইউজার সব কিছু এডিট করতে পারবে; সাধারণ ইউজার শুধু নিজের designation-এর
entry submit করতে পারবে (`EmployeeAssignment` মডেল দিয়ে ইউজার ↔ designation লিংক করা)।

## ৪. ফ্রন্টএন্ড সংযোগ (পরবর্তী ধাপ)
বর্তমানে `index.html`-এর সব ফাংশন (`ENTRIES`, `CFG`, ইত্যাদি) `localStorage`/`IndexedDB`
ব্যবহার করে। এগুলোকে `fetch('/api/rizviworld/...')` কলে বদলাতে হবে — যেমন:

```js
// আগে (localStorage):
ENTRIES.push(newEntry); saveEntries();

// পরে (Django API):
await fetch('/api/rizviworld/entries/', {
  method:'POST',
  headers:{'Content-Type':'application/json','X-CSRFToken':getCookie('csrftoken')},
  body: JSON.stringify(newEntry)
});
```

Voice/video/document ফাইলের জন্য JSON-এর বদলে `FormData` ব্যবহার করতে হবে, যেহেতু ওগুলো
বাইনারি ফাইল আপলোড।

এই রূপান্তরটা প্রতিটা ফাংশনে করা লাগবে (`renderDashboard`, `renderDesignation`,
`renderSettings`, `renderFeedback`) — এটা একটা আলাদা, নিয়ন্ত্রিত ধাপ হিসেবে করাই ভালো, যাতে
প্রতিটা পেজ টেস্ট করে নেওয়া যায়।
