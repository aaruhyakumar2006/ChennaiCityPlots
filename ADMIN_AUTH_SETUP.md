# Admin Authentication System Setup Guide

## Overview

This application now has a **unified login system** where users and admins use the same login page but are automatically routed to different dashboard based on their admin status stored in the database.

## Key Changes

### 1. **Database Schema**
The `Admin` table has been updated in `prisma/schema.prisma`:

```prisma
model Admin {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String
  role      String    @default("admin") // admin | superadmin
  active    Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

**Key points:**
- No password field (Supabase Auth handles credentials)
- `active` field controls whether an admin can access the system
- `role` field supports `admin` and `superadmin` (for admin management)

### 2. **Authentication Flow**

#### Login Page (`src/pages/LoginPage.tsx`)
- **Single unified login page** for both users and admins
- Users sign in with email/password
- System checks if user exists in `Admin` table
- **Routing:**
  - If user is in `Admin` table → redirects to `/admin`
  - Otherwise → redirects to home page or previous page

#### Admin Context (`src/App.tsx`)
- New `AuthProvider` that tracks both `session` and `isAdmin` status
- `isAdmin` is determined by checking the `Admin` table using `isAdminUser()` function
- Both values accessible via `useAuth()` hook

#### Protected Routes
- `/admin/*` routes require both authentication AND admin status
- Non-admin authenticated users cannot access admin routes
- Attempts to access admin routes redirect to home page

### 3. **Admin Management**

#### New Admin Access Page (`src/pages/admin/AdminAccessPage.tsx`)
**Location:** `/admin/access`

**Features:**
- Only **superadmins** can manage admin users
- Add new admin users by email and name
- Assign `admin` or `superadmin` role
- Deactivate admin users
- View all active admin users

#### How to Add an Admin:

1. **Create superadmin first** (requires direct database insert):
   ```sql
   INSERT INTO "Admin" (email, name, role, active)
   VALUES ('you@madrascityplots.com', 'Your Name', 'superadmin', true);
   ```

2. **Access admin access page** at `/admin/access`

3. **Add new admin users:**
   - Email: admin email address
   - Name: Full name
   - Role: Choose `admin` or `superadmin`
   - Click "Add Admin"

4. **New admin must sign up:**
   - They go to login page
   - They create account with their email address
   - System automatically recognizes them as admin
   - Next login redirects them to admin dashboard

### 4. **Key Files Modified**

| File | Changes |
|------|---------|
| `src/App.tsx` | New auth context with `isAdmin` status, import `isAdminUser` |
| `src/pages/LoginPage.tsx` | Import `isAdminUser`, use it to route users/admins |
| `src/pages/admin/AdminAccessPage.tsx` | **NEW** - Admin management UI |
| `src/lib/adminAuth.ts` | **NEW** - Admin authorization functions |
| `src/layouts/AdminLayout.tsx` | Added admin access link to navigation |
| `src/components/Navbar.tsx` | Use new `useAuth()` hook for admin status |
| `src/components/AuthGateModal.tsx` | Use new `isAdminUser()` function |
| `prisma/schema.prisma` | Updated `Admin` model |
| `prisma/migrations/update_admin_model/migration.sql` | **NEW** - Schema migration |

### 5. **Environment Setup**

#### `.env` Requirements
No changes needed! The system no longer relies on `VITE_ADMIN_EMAILS` whitelist. All admin users are managed via the database.

The `VITE_ADMIN_EMAILS` variable can be removed (it's now deprecated).

### 6. **Database Setup**

#### Create Initial Superadmin
Run this SQL query in your Supabase dashboard:

```sql
INSERT INTO "Admin" (email, name, role, active, "createdAt", "updatedAt")
VALUES (
  'your-admin-email@madrascityplots.com',
  'Admin Name',
  'superadmin',
  true,
  NOW(),
  NOW()
);
```

#### Apply Migration
```bash
npx prisma migrate deploy
```

Or if starting fresh:
```bash
npx prisma migrate dev --name update_admin_table
```

### 7. **Admin Role Capabilities**

#### Admin User
- Can manage leads, properties, site visits, testimonials, builders
- Cannot add/remove other admins
- Cannot change roles

#### Superadmin User
- All capabilities of admin
- **Can manage admin users** (add/remove/view)
- Can create new admins
- Can deactivate other admins

### 8. **Testing the System**

#### Test Case 1: User Login
1. Go to `/login`
2. Sign up with email `user@example.com`
3. Verify you land on home page after login
4. Verify "Admin Panel" button is NOT shown in navbar

#### Test Case 2: Admin Login
1. Add admin via database or admin panel
2. Go to `/login`
3. Sign up/login with admin email
4. Verify you're redirected to `/admin`
5. Verify "Admin Panel" button IS shown in navbar
6. Verify you can access `/admin/access` (if superadmin)

#### Test Case 3: Non-Admin Cannot Access Admin Routes
1. Login as regular user
2. Try to navigate to `/admin`
3. Should be redirected to home page
4. Check browser console for no errors

### 9. **Security Considerations**

✅ **Secure aspects:**
- Passwords handled by Supabase Auth (industry standard)
- Admin status checked in database on every auth state change
- Admin routes protected with `RequireAuth` component
- Admin table requires email uniqueness
- Superadmin-only operations for admin management
- `active` field prevents revoked admins from accessing system

⚠️ **Important:**
- First superadmin must be created via direct SQL
- Never expose Supabase service role key in frontend
- Keep admin emails confidential
- Regularly audit admin table for inactive users

### 10. **Troubleshooting**

#### Issue: Can't access admin panel after login
**Solution:** Check if email exists in `Admin` table and `active = true`

#### Issue: "Admin Access" page shows access denied
**Solution:** Ensure your admin user has `role = 'superadmin'`

#### Issue: TypeScript errors about Admin types
**Solution:** These are suppressed with `as any` due to Supabase SDK limitations - they can be safely ignored

### 11. **Future Enhancements**

- [ ] Email verification when adding admin
- [ ] Admin activity logging
- [ ] Admin password reset flow
- [ ] Two-factor authentication for admins
- [ ] Admin role descriptions and permissions matrix
- [ ] Invitation flow for new admins (instead of database insert)

---

## Quick Start Checklist

- [ ] Run database migration: `npx prisma migrate deploy`
- [ ] Insert initial superadmin via SQL
- [ ] Test user login → home page
- [ ] Test admin login → admin dashboard
- [ ] Add another admin via admin access page
- [ ] Test deactivating an admin
- [ ] Verify deactivated admin cannot login

---

**Last Updated:** July 11, 2026
**Version:** 1.0.0
