# Deploy the Zuwaina & Sohail invitation to Vercel

This project uses Vercel Node.js Functions in `/api` and a Neon PostgreSQL database. Keep the `api` folder at the project root. Do not set Vercel's Output Directory to `public`: doing so can make the static output configuration conflict with the root-level API functions.

## 1. Create the hosted database

1. Create a PostgreSQL project in Neon: https://neon.com/
2. In the Neon dashboard, copy the connection string for the database. Use the pooled connection string if Neon offers both pooled and direct options.
3. Keep the connection string private. Do not paste it into `public/index.html`, `public/admin.html`, or any other browser-side file.

## 2. Put the project in GitHub

1. Extract this ZIP.
2. Open the extracted `nikah-invitation` folder. The files `package.json`, `vercel.json`, and the folders `api` and `public` should be directly inside it.
3. Upload the *contents* of this folder to the root of a new GitHub repository. Do not upload an extra parent folder around them.

## 3. Import into Vercel

1. In Vercel, choose **Add New → Project** and import that GitHub repository.
2. Set **Framework Preset** to `Other`.
3. Set **Root Directory** to `./` (the repository root, where `package.json`, `api`, and `public` are located).
4. Leave **Build Command** empty.
5. Leave **Output Directory** empty / unset. Do not enter `public`.
6. Leave **Install Command** as the default (`npm install`).
7. Deploy once. The first deployment may not have database credentials yet; add them in the next step and redeploy.

## 4. Add environment variables

In Vercel → Project → Settings → Environment Variables, add:

- `DATABASE_URL` = the Neon PostgreSQL connection string.
- `ADMIN_KEY` = a long, private password for the admin dashboard.

Select **Production** (and Preview too, if you will test preview deployments). Save, then redeploy the latest deployment. Environment variable changes only apply to new deployments.

## 5. Verify the backend before testing the forms

Open these URLs on your deployed domain:

- `https://YOUR-DOMAIN.vercel.app/api/health` should return `{"ok":true,"database":"connected"}`.
- `https://YOUR-DOMAIN.vercel.app/api/wishes` should return `[]` when no wishes have been submitted yet.
- Opening `/api/rsvp` directly with GET should return HTTP 405. This is expected; the RSVP endpoint accepts POST requests from the form.

If `/api/health` says `DATABASE_URL is missing`, check the variable name and make sure Production is selected, then redeploy. If it says the database connection failed, copy a fresh Neon connection string into `DATABASE_URL` and redeploy. If the API URL returns 404, confirm the Vercel Root Directory is the repository root and that `api/health.js` is present at that root.

## 6. Test the live invitation

1. Open the deployed home page and submit a test RSVP.
2. Submit a test dua/wish.
3. Refresh the page; the wish should remain visible.
4. Open `https://YOUR-DOMAIN.vercel.app/admin` and sign in with the `ADMIN_KEY` value.
5. Confirm the test RSVP and wish appear in the dashboard.

## Local website

The included `server.js` still runs the local version on `http://localhost:3000` and saves local submissions to `data.json`. Local JSON data and the hosted Neon database are separate; local submissions are not automatically copied to the hosted database.


## 7. If RSVP still returns HTTP 500

1. Visit `https://YOUR-DOMAIN.vercel.app/api/health` first. It must return `database: connected`.
2. If it reports `DATABASE_URL is missing`, add the Neon connection string under Vercel → Settings → Environment Variables with the exact name `DATABASE_URL`, select Production, save, and redeploy.
3. If it reports a connection failure, copy a fresh connection string from Neon (prefer the pooled connection string) and replace the value. Do not include quotes or paste the secret into frontend files.
4. If health is connected but RSVP still fails, open Vercel → Project → Deployments → latest deployment → Functions → `api/rsvp` → Logs. The log now prints the database error message without returning credentials to the browser.
5. This version also adds missing columns to older `rsvps` and `wishes` tables automatically. It does not delete existing rows.
