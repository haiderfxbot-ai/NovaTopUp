# NovaTopUp — Phase 1

Premium gaming/social top-up marketplace (Free Fire Diamonds, PUBG UC, TikTok
Coins) with manual payment approval (Easypaisa, JazzCash, Binance, debit
card). This is **Phase 1 of 5** — the project foundation.

## What's included in Phase 1

- Next.js 14 (App Router) + Tailwind CSS, premium dark/glass theme
- Landing page with hero + placeholder services grid
- Auth pages: Sign up / Log in with Email+Password, Google, and Guest
  (Firebase Authentication)
- Hidden admin panel at `/admin-x7k9-panel` (not linked anywhere on the
  public site) with a login gate and a dashboard shell
- Admin **Settings** page to connect Firebase **without touching code** —
  paste your Web SDK config and it's stored outside the source tree
- Firebase Realtime Database auto-creates its starter tables (`users`,
  `admins`, `services`, `orders`, `transactions`, `coupons`,
  `paymentAccounts`, `settings`) the first time the app connects

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Connecting Firebase (no code editing required)

1. Create a Firebase project → add a **Web App** → copy the SDK config
   (apiKey, authDomain, projectId, storageBucket, messagingSenderId,
   appId, databaseURL).
2. Enable **Authentication** → Email/Password, Google, and Anonymous
   sign-in methods.
3. Create a **Realtime Database**.
4. Run the app, go to `http://localhost:3000/admin-x7k9-panel`
   - Default admin login: username `admin`, password `ChangeMe_123!`
     (change these via environment variables below before going live)
5. Open **Settings** and paste the Firebase config → Save & connect.

### Where the Firebase config actually lives

- **Locally / self-hosted (VPS):** saved to `data/firebase-config.local.json`
  (already git-ignored, never pushed to GitHub).
- **On Vercel:** the filesystem is temporary, so instead add the same
  values as **Environment Variables** in Vercel → Project → Settings →
  Environment Variables:
  - `FIREBASE_API_KEY`
  - `FIREBASE_AUTH_DOMAIN`
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_STORAGE_BUCKET`
  - `FIREBASE_MESSAGING_SENDER_ID`
  - `FIREBASE_APP_ID`
  - `FIREBASE_DATABASE_URL`

  This is still "not in the code" — it's typed into Vercel's own
  dashboard, reachable only by whoever is logged into your Vercel
  account.

### Admin login credentials

Set these as environment variables before deploying (Phase 2 adds a
proper "change admin username/password" screen inside the admin panel
itself):

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET` (any long random string)

## Deploying

1. `git init && git add . && git commit -m "Phase 1"`
2. Push to a new GitHub repository
3. Import the repo in Vercel → add the environment variables above →
   Deploy
4. Every future `git push` auto-redeploys

## Realtime Database security rules

Since the admin panel writes through the Admin SDK (which bypasses rules
entirely) and end users only need to **read** services/payment
accounts/coupons and **read their own** transactions, set your Realtime
Database rules to something like this in the Firebase Console → Realtime
Database → Rules:

```json
{
  "rules": {
    "services": { ".read": true, ".write": false },
    "paymentAccounts": { ".read": true, ".write": false },
    "coupons": { ".read": true, ".write": false },
    "transactions": {
      ".indexOn": ["userId"],
      ".read": false,
      ".write": false
    },
    "users": {
      ".indexOn": ["username"],
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "otps": { ".read": false, ".write": false },
    "admins": { ".read": false, ".write": false },
    "orders": { ".read": false, ".write": false },
    "settings": { ".read": true, ".write": false }
  }
}
```

All reads of `transactions` (order tracking, "my orders") and every write
anywhere go through the Next.js API routes using the Admin SDK, which is
why direct client read/write is locked to `false` there. `users/$uid` is
the one exception — signed-in users write their own username/email
profile directly from the client right after signup.

## Email OTP (sign-up verification + forgot password)

1. Create a free account at [emailjs.com](https://www.emailjs.com).
2. Connect an email service (Gmail, Outlook, or any SMTP inbox) — this
   is done once, inside EmailJS's own dashboard.
3. Create one email template with two variables in the body/subject:
   `{{to_email}}` and `{{otp_code}}`.
4. Copy the **Service ID**, **Template ID**, **Public Key**, and
   **Private Key** from EmailJS → paste them into
   `/admin-x7k9-panel/dashboard/settings` → **Email OTP** tab.

Once saved, sign-up sends a 6-digit code before the account is created,
and "Forgot password" (accepts email or username) sends a code before
letting someone set a new password.

## Phase 5 — animations & polish

- **Three.js "automation core"** (`components/ThreeOrb.js`) — the rotating
  wireframe rings + particle field in the hero section
- **GSAP** — entrance animations on the hero, staggered service-card
  reveals, hover lift on cards
- **Professional spinner** (`components/OrderSpinner.js`) — multi-ring
  animated SVG used for service loading and order submission, in place
  of plain "Loading..." text
- **Coded mascot character** (`components/AnimatedCharacter.js`) — a
  small robot drawn entirely in SVG and animated with GSAP (floats,
  blinks, glows). A note on **why this isn't Rive**: Rive characters are
  built from a `.riv` file authored in the Rive design editor — that's a
  visual design asset, not something that can be generated purely from
  code. This component is the practical equivalent, built the way you
  originally described ("animated characters built from coding
  knowledge"). If you'd still like true Rive support later, design the
  character in Rive's free editor, export the `.riv` file, and it can be
  dropped in using the `@rive-app/react-canvas` package.

## Roadmap

- ~~**Phase 2** — Full admin panel~~ ✅ done
- ~~**Phase 3** — User-facing features~~ ✅ done
- ~~**Phase 4** — Email OTP sign-up verification + forgot password~~ ✅ done
- ~~**Phase 5** — Animations & polish~~ ✅ done

All five phases are complete. See the sections above for setup at every
layer (Firebase, Admin SDK, Email OTP, security rules).
