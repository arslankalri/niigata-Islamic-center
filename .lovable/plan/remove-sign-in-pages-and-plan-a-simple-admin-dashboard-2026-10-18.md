# Remove sign-in pages and plan a simple admin dashboard

## Step 1: Remove the current sign-in pages
- Delete the member sign-in page (`/login`), the members page (`/members`) and the password reset page (`/reset-password`).
- Old links to these pages will show the normal "page not found" screen.
- The public website stays exactly as it is.

## Step 2: Admin dashboard (recommended setup)

**Signing in: "Sign in with Google" only**
- One button. You use your Gmail account (arslankalri@gmail.com).
- There's no password to create, remember or reset, and no sign-up form.
- The database only gives admin rights to your email. If anyone else signs in with Google, they get no access and see "Not authorised".

**What the dashboard does first: announcements**
- A list of all your articles with draft or published status.
- An editor with Urdu, English and Japanese fields, a cover photo, extra photos, an author and a publication date.
- Publish or unpublish with one click. Published articles appear on the Announcements page and in the homepage banner, newest first.
- The articles already on the site get copied into the dashboard so you can edit them there.

**Later, if you want them**
- Events editor, which would also cover the clean-up campaign event.
- A simple visitor count with no tracking.

## Technical details
- Remove `src/routes/login.tsx`, `members.tsx` and `reset-password.tsx`. Turn off email/password sign-in.
- Turn on the Google sign-in provider. Add a public `/admin/login` page with a Google button, and put the dashboard under `_authenticated/admin`. Check admin rights with `has_role()` in the database and the security rules (RLS).
- Use the existing `announcements` and `announcement_images` tables and the private media folder. The public pages read published rows, and the static articles act as a backup until the copy is done.
