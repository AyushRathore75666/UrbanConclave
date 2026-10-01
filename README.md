# MP Conclave GIS

Public website and admin panel for the Madhya Pradesh Global Investors Summit. An investor can file an investment interest from any page. The header keeps **Submit Investment Interest** one click away.

## What you are running

- `apps/web` — Next.js site (English and Hindi)
- `apps/api` — Express API, validation, OTP, file checks, email/SMS, admin roles
- PostgreSQL — started for you on port 5433. Docker is optional.

Dates, statistics, leadership messages, and downloadable PDFs are placeholders. Replace them before announcing the site. Nothing on the public pages is an official quote or an official statistic.

The attached creative shows 24–25 February 2025 in Bhopal. The countdown uses **24–25 February 2027** so the timer is in the future. Change both the visible dates and `startISO` in the admin content screen.

## Run it locally

```bash
npm install
npm run dev
```

- Site: http://localhost:3000
- API: http://127.0.0.1:4000/api/health
- Admin: http://localhost:3000/admin/login

The first start downloads a local Postgres build and can take a few minutes. Later starts are quicker.

On first launch the API writes `apps/api/.env` with generated secrets. The seeded password is `ChangeMe!2026` unless you change `SEED_ADMIN_PASSWORD` before the first start.

| Email | Role |
| --- | --- |
| super@mpconclave.local | Super Admin |
| editor@mpconclave.local | Content Editor |
| invest@mpconclave.local | Investment Team |
| viewer@mpconclave.local | Viewer |

Change these passwords by creating new accounts and retiring the seeded ones before go-live. Restarting the API does not reset a password that was already created.

## Check the main flows

With the API running:

```bash
npm run smoke
```

That files a test interest, checks status, signs in, updates the lead, and exports CSV.

## Where content lives

Day-to-day edits do not need a code change. Sign in as Super Admin or Content Editor and open **Content**. English and Hindi are stored separately.

The same copy starts in `content/en.json` and `content/hi.json`. Those files are used only for the first database seed and as a fallback if the API is down. After the first save in the admin panel, the database copy is what the site shows.

How to edit each area, and how to deploy, is in [CONTENT_GUIDE.md](CONTENT_GUIDE.md).

## Database schema

The schema is `apps/api/prisma/schema.prisma`.

- `User` — admin accounts and roles
- `Submission` — investment interests. Email and mobile are encrypted. A hash is kept so status lookup does not need the plaintext.
- `Note` — officer notes on a lead
- `OtpCode` — one-time codes, stored as hashes
- `CaptchaChallenge` — math captcha answers, stored as hashes
- `ContentDocument` — English and Hindi page content
- `AuditLog` — admin actions
- `ContactMessage` — helpdesk form

Uploads are stored in `apps/api/uploads` after a PDF/DOCX signature check. If `CLAMAV_HOST` is set, the file is also sent to ClamAV.

## Environment

See `.env.example`. Important production settings:

- `USE_EMBEDDED_PG=false` and a real `DATABASE_URL`
- `OTP_DEV_ECHO=false`
- `SMTP_*` and `SMS_API_URL` / `SMS_API_KEY`
- `DATA_ENCRYPTION_KEY` and `JWT_SECRET` generated once and kept. If the encryption key changes, stored emails and mobiles cannot be read.
- `RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET` to replace the math question
- `WEB_ORIGIN` set to the public site origin

The SMS gateway is a generic `POST` of `{ "to", "message" }` with `Authorization: Bearer <SMS_API_KEY>`. Point `SMS_API_URL` at your provider’s adapter.

When SMTP or SMS is empty, messages are appended to `apps/api/data/outbox.log` and, in local mode, the one-time code is shown on the form.

## Deploy

Run two processes behind HTTPS:

1. `npm run start -w @mpgis/api` (listens on `0.0.0.0:$PORT`)
2. `npm run start -w @mpgis/web` (listens on port 3000 unless you change it)

Set `API_INTERNAL_URL` for the Next.js rewrite, for example `http://127.0.0.1:4000`, so the browser can call `/backend/...` on the same origin.

Give the API a persistent disk for `apps/api/uploads` and `apps/api/data`. A platform with an ephemeral disk will drop uploaded files on restart. For more than one API instance, move uploads to private object storage and keep a single Postgres database.

A `docker-compose.yml` file is included if you want Postgres in Docker instead of the embedded database.
