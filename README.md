# Zuwaina & Sohail — Interactive Nikah Invitation

A responsive, animated wedding invitation for **Saturday, 19 December 2026 at 7:00 PM onwards**. The opening key-and-door experience is preserved, followed by a scroll-led invitation with soft falling petals, a rose-petal button, a live countdown, an event timeline, duas, separate RSVP and wishes forms, and Wedora Studio contact details.

## Run on Windows

1. Install **Node.js 18 or newer** from https://nodejs.org/ if it is not installed.
2. Extract this ZIP to a normal folder (for example, Desktop).
3. Open the extracted `nikah-invitation (3)` folder.
4. Double-click `START_NIKAH.bat`.
5. Open **http://localhost:3000** in your browser if it does not open automatically.

### If the BAT file is blocked or does not work

1. Open the project folder in File Explorer.
2. Click the address bar, type `cmd`, and press Enter.
3. In the terminal that opens, run:

   ```bat
   node server.js
   ```

4. Keep that terminal window open and visit **http://localhost:3000**.

No separate `npm install` is needed for the local server's built-in Node.js functionality. An internet connection is used for the Google Fonts styling.

## RSVP and wishes

The local server receives RSVP submissions and wishes. The admin page is at **http://localhost:3000/admin**. The default local admin key is `change-me`; set `ADMIN_KEY` before sharing a public deployment. For persistent hosted data, configure `DATABASE_URL` and `ADMIN_KEY` in Vercel as described in `VERCEL_SETUP.md`.

## Main details included

- Bride: Dr. Zuwaina Aalyani
- Groom: Sohail Mohammed Gaziyani
- Date: Saturday, 19 December 2026
- Countdown target: 19 December 2026, 7:00 PM India time; changes to “Alhamdulillah, Married!” when the target is reached
- Venue: Rolex Banquet, Ram Mandir Rd, near Skoda Service, Somani Gram, Jogeshwari West, Mumbai 400104, Maharashtra
- Instagram: https://www.instagram.com/ziyad_aalyani/
- Email: wedorastudio.byziyad@gmail.com
