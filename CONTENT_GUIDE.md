# Editing content and deploying MP Conclave GIS

## Edit without changing code

1. Open http://localhost:3000/admin/login
2. Sign in as `editor@mpconclave.local` or `super@mpconclave.local`
3. Open **Content**
4. Choose English or Hindi
5. Change the summit title, dates, countdown start, venue, theme, the six number tiles, leadership messages, and helpdesk email and phone
6. Choose **Save content**

Reload the public site. The countdown uses the ISO date, for example `2027-02-24T09:00:00+05:30`. The sentence under the number tiles is the stats note. Clear that sentence only after the numbers are the published ones.

For agenda, sectors, FAQs, news, downloads, testimonials, and page text, open **Edit the full document**, change the JSON, and save. Keep the same field names. Sector `slug` values are also the values stored on investment forms, so rename a slug only if you are comfortable leaving older leads on the previous slug.

### Replace a PDF

Put the new file in `apps/web/public/downloads/` using the same filename:

- `brochure.pdf`
- `incentive-guide.pdf`
- `policy-documents.pdf`

Or change the `file` path in the downloads section of the content document and add your PDF under `apps/web/public/`.

### Replace a portrait or logo

Files in `apps/web/public/brand/`:

- `invest-wordmark.jpg` — header
- `gis-mark.png` — hero emblem
- `leaders.png` — the two portraits, left then right
- `summit-banner.jpg` — media gallery

### Leadership messages

The names and roles match the supplied portraits. The messages are placeholders. Paste the approved text in the content screen. Do not publish a sentence as a quotation unless it has been cleared.

### Sample leads

The dashboard includes records named “Sample Company”. A super admin can delete them with **Delete sample interests**. Real submissions are kept.

## Investment interest

The form is at `/invest`. Drafts stay in the visitor’s browser until they submit or clear site data.

Mandatory checks:

- company, organisation type, country, address, city, state, PIN
- contact name, designation, verified email, verified mobile
- at least one sector, an amount, a timeline, a description of 20 to 1500 characters
- consent and captcha

The upload is optional. If present, it must be a PDF or DOCX of 10 MB or less. Macro-enabled Word files are refused.

After submit, the visitor sees a reference number such as `MPGIS-2026-XXXXXXXX`. Status lookup asks for that reference and the same email. Viewers in the admin panel see masked email and mobile. Super admins and the investment team see the full contact details, can assign an officer, add notes, and move the status:

Received → Under Review → Contacted → Meeting Scheduled → Closed

Export to Excel or CSV uses the filters currently on the interests screen.

## Roles

| Role | Can do |
| --- | --- |
| Super Admin | Everything, including users, audit log, and deleting sample data |
| Content Editor | Edit English and Hindi content, see the dashboard |
| Investment Team | Work interests, notes, assignment, export |
| Viewer | Read interests with masked contact details, dashboard, and the audit log |

Every admin sign-in, failed sign-in, content save, status change, note, export, and new user is written to the audit log.

## Deploy

1. Create a Postgres database.
2. Copy `.env.example` to `apps/api/.env`.
3. Set `USE_EMBEDDED_PG=false`, `DATABASE_URL`, `OTP_DEV_ECHO=false`, `JWT_SECRET`, and `DATA_ENCRYPTION_KEY` (64 hex characters).
4. Set `WEB_ORIGIN` to the public https origin, and SMTP plus SMS values.
5. Set `SEED_ADMIN_PASSWORD` before the first boot, then sign in and create personal accounts.
6. Install and build:

```bash
npm install
npm run build
```

7. Start the API and the web process under HTTPS. Set `API_INTERNAL_URL` to the API’s private address so the website can proxy `/backend`.
8. Put a persistent volume on `apps/api/uploads`.
9. Optional: run ClamAV and set `CLAMAV_HOST` and `CLAMAV_PORT`.
10. Optional: set both reCAPTCHA variables. The math question is used until they are set.

On Render, bind the API with `PORT` (the process already listens on `0.0.0.0`). The filesystem is ephemeral, so uploads need a persistent disk or they disappear on the next deploy. Use a managed Postgres URL and turn the embedded database off.
