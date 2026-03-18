# Goodrich Summer Fete 2026

Website for the Goodrich Summer Fete — 27th June 2026 at The Old Vicarage, Goodrich.

**Live site:** [goodrichfete.com](https://goodrichfete.com)

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, and JavaScript (no frameworks)
- **Hosting:** Cloudflare Workers with static asset serving
- **Form storage:** Cloudflare KV
- **Email notifications:** Resend
- **Fonts:** Google Fonts (Playfair Display + DM Sans)

## Project Structure

```
Website/
├── public/              # Static files served to visitors
│   ├── index.html       # Main page
│   ├── privacy.html     # Privacy policy
│   ├── styles.css       # All styles
│   ├── script.js        # Interactions, countdown, video
│   └── images/          # Optimised event photos
├── src/
│   └── index.ts         # Cloudflare Worker (form API + email)
├── wrangler.toml        # Cloudflare deployment config
└── package.json
```

## Local Development

```bash
npm install
npm run dev
```

This starts a local dev server at `http://localhost:8787`.

## Editing Content

All content is in `public/index.html`. Key sections:

| Section | What it covers |
|---------|---------------|
| Hero | Title, date, countdown, video background |
| About | Welcome text, stats |
| What's On | Attraction cards (coconut shy, bouncy castles, etc.) |
| Competitions | Bake-off, growers, dog show, children's art |
| Food & Drink | BBQ, pizza, Mexican bar, tea & cake |
| Evening | The Hostelrie from 5pm, live band |
| Gallery | Photo mosaic |
| Video | YouTube highlights embed |
| Contact | Enquiry form + volunteer CTA |

### Updating images

Replace files in `public/images/`. Keep them as JPEG, ideally under 300KB and no wider than 1920px.

### Changing the date

The countdown targets `2026-06-27T12:00:00+01:00` (BST) — update this in `public/script.js` if the date changes.

### YouTube video

The hero background and the dedicated video section both use video ID `xQjKBU6a5K8`. To change it, search for this ID in `index.html` and `script.js` and replace it.

## Deployment

### First-time setup

1. **Create the KV namespace** for storing form submissions:

   ```bash
   npx wrangler kv namespace create CONTACT_SUBMISSIONS
   ```

   Copy the `id` from the output and paste it into `wrangler.toml`, uncommenting the `[[kv_namespaces]]` block.

2. **Set up Resend** for email notifications:

   - Sign up at [resend.com](https://resend.com) and verify the `goodrichfete.com` domain
   - Create an API key
   - Store it as a secret:

   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```

3. **Configure the custom domain** in the Cloudflare dashboard:
   - Go to Workers & Pages > goodrich-fete > Settings > Domains
   - Add `goodrichfete.com`
   - Delete any existing A records for the domain in DNS settings

### Deploying changes

```bash
npm run deploy
```

That's it. Changes go live immediately.

## Contact Form

Form submissions are:
- **Stored** in Cloudflare KV (auto-expires after 1 year)
- **Emailed** to hello@goodrichfete.com via Resend

To view stored submissions, visit:
```
https://goodrichfete.com/api/submissions?key=your-secret-key
```

## Privacy

The site includes a privacy policy at `/privacy.html`. Key points:
- We only collect what's submitted via the form
- No cookies, tracking, or analytics
- Data is never sold or used for marketing
- Submissions auto-delete after 1 year

## Contributing

Edit files in `public/` for content changes. Run `npm run dev` to preview locally, then `npm run deploy` to publish.
