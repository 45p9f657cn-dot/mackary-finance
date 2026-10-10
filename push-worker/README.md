# MACKARY FINANCE phone reminders

This optional service delivers bill, debt, and expected-income reminders when the app is closed. It uses Cloudflare Workers, a D1 database, and the standard Web Push protocol.

## What is stored online

The app keeps all finance records on the device. When phone reminders are enabled, this service stores the device's push subscription and only the reminder details needed to send alerts: item names, amounts, purposes, and reminder dates. The device authorization token is stored as a one-way hash. Do not place VAPID private keys in the app or GitHub Pages.

## Deploy the reminder service

You need a Cloudflare account and Node.js/npm on a computer.

1. Open a terminal in this `push-worker` folder and run:

   ```sh
   npm install
   npx wrangler login
   npx wrangler d1 create mackary-finance-push
   ```

2. Cloudflare prints a database ID. Replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.toml` with that ID.

3. Create VAPID keys. The VAPID private key stays in Cloudflare; the public key is returned to the app by the Worker.

   ```sh
   npx --yes web-push generate-vapid-keys
   ```

   Copy the private key and add it as a Cloudflare secret:

   ```sh
   npx wrangler secret put VAPID_SERVER_PRIVATE_KEY
   ```

   Paste the private key when prompted. Add the public key the same way:

   ```sh
   npx wrangler secret put VAPID_SERVER_PUBLIC_KEY
   ```

4. Create the D1 tables and deploy:

   ```sh
   npx wrangler d1 migrations apply mackary-finance-push --remote
   npx wrangler deploy
   ```

5. Cloudflare prints a Worker address ending in `.workers.dev`. In the repository's root `push-config.json`, set `apiUrl` to that address (without a trailing slash), commit the file, and let GitHub Pages publish it.

6. Open MACKARY FINANCE on each phone, add it to the Home Screen if using iPhone, then open **Settings → Background phone reminders → Enable**. Allow notifications when the phone asks. Use **Send test notification** to confirm delivery.

## Reminder timing

The Worker checks once each day at 8:00 a.m. Zambia time. Bills follow their selected reminder setting and also remind on the due date. Debts remind three days before and on the due date. Expected-income reminders arrive on the first day of the expected month. Past dates are skipped.

The Worker sends one notification per scheduled reminder. Notifications require internet access and the phone's notification permission. On iPhone/iPad, web push requires iOS/iPadOS 16.4 or later and the app added to the Home Screen.

To disable a device, use **Turn off phone reminders** in app Settings. This removes its subscription and reminder schedule from the D1 database.
