# 🚀 Complete Setup Instructions - NEW FILE

## ✅ Fresh Start with New SQL File

You deleted the old files, so here's the complete fresh setup.

---

## 📋 Step 1: Copy the SQL

**File to use:** `SUPABASE_FINAL.sql` ← This is your new file

This file has:
- ✅ All 12 tables (admin, property, lead, site_visit, etc.)
- ✅ Fixed RLS policies (no UUID/TEXT errors)
- ✅ Safe enum creation
- ✅ All indexes and relationships
- ✅ Helper functions

---

## 🌐 Step 2: Open Supabase SQL Editor

1. Go to **Supabase Dashboard** → https://supabase.com/dashboard
2. Select your **project**
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

---

## 3️⃣ Step 3: Copy & Paste

1. **Open:** `SUPABASE_FINAL.sql` (from your project root)
2. **Select All:** `Ctrl+A` (or `Cmd+A`)
3. **Copy:** `Ctrl+C` (or `Cmd+C`)
4. **Paste** into Supabase SQL Editor
5. **Click Run** (or `Ctrl+Enter`)

---

## ⏳ Step 4: Wait for Completion

Watch for success messages. This takes about 30-60 seconds.

You should see:
```
Query executed successfully
```

---

## 👤 Step 5: Create Superadmin User

Run this SQL in Supabase (replace with your info):

```sql
INSERT INTO public.admin (email, name, role, active)
VALUES ('your-email@madrascityplots.com', 'Your Name', 'superadmin', true)
ON CONFLICT (email) DO NOTHING;
```

**Replace:**
- `your-email@madrascityplots.com` → Your actual email
- `Your Name` → Your name

---

## ⚙️ Step 6: Configure Environment

In your project root, create or update `.env`:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"
VITE_SITE_URL="https://www.madrascityplots.com"
```

**Get these from:** Supabase Dashboard → Settings → API

---

## 🏃 Step 7: Test Locally

```bash
cd prabhadhivya-homes-app
npm install
npm run dev
```

Go to: `http://localhost:5173/login`

---

## ✨ Step 8: Test Login

1. Sign up with email/password
2. Go back to login page
3. If your email is in the `admin` table → redirects to `/admin` ✅
4. Otherwise → redirects to home page ✅

---

## ✅ Verification Checklist

- [ ] SQL script ran successfully in Supabase
- [ ] Superadmin user created
- [ ] `.env` configured with Supabase credentials
- [ ] `npm run dev` works locally
- [ ] Can signup/login at `/login`
- [ ] Admin redirects to `/admin` dashboard
- [ ] Regular user redirects to home

---

## 📊 What the SQL File Creates

| Table | Records | Purpose |
|-------|---------|---------|
| admin | 0+ | Admin users & roles |
| property | 0+ | Real estate plots |
| property_image | 0+ | Property photos |
| document | 0+ | Legal docs |
| nearby_place | 0+ | Landmarks |
| property_video | 0+ | YouTube videos |
| lead | 0+ | Customer inquiries |
| site_visit | 0+ | Tour bookings |
| user_wishlist | 0+ | Saved properties |
| testimonial | 0+ | Reviews |
| builder | 0+ | Developers |

---

## 🆘 Troubleshooting

### "ERROR: type already exists"
This is fine - the script handles it. Just continue.

### "ERROR: UUID vs TEXT"
Already fixed in this version ✅

### "Connection failed"
Check your `.env` Supabase credentials

### "Build fails"
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 Quick Reference

| File | Purpose |
|------|---------|
| `SUPABASE_FINAL.sql` | Complete SQL schema (use this!) |
| `START_HERE.md` | Quick start guide |
| `README_FINAL.md` | Complete documentation |
| `ADMIN_AUTH_SETUP.md` | Admin system details |
| `.env.example` | Environment template |

---

## 🚀 Next Steps

1. ✅ Run SQL in Supabase
2. ✅ Create superadmin
3. ✅ Configure `.env`
4. ✅ Test locally
5. ✅ Deploy!

---

**Status:** 🟢 Ready to Set Up  
**Time:** ~10 minutes  
**File:** `SUPABASE_FINAL.sql`  
