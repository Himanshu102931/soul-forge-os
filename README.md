# Life OS (React + Vite)

## Project info

**URL**: https://lovable.dev/projects/8f0c54c3-ed54-4412-9b44-d47918410688

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8f0c54c3-ed54-4412-9b44-d47918410688) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Local development

```sh
npm ci
npm run dev
```

## CI
- Runs on push/PR: npm test (placeholder), tsc --noEmit, npm run lint, npm run build

## Deployment (GitHub Pages)
- Workflow: .github/workflows/deploy.yml
- Public URL: https://himanshu102931.github.io/soul-forge-os/
- Base path is set automatically for Pages. For a custom domain, set Vite base to "/".
- Required secrets (repo → Settings → Secrets → Actions):
	- VITE_SUPABASE_URL
	- VITE_SUPABASE_PUBLISHABLE_KEY

## Environment variables (.env)
- VITE_SUPABASE_PROJECT_ID
- VITE_SUPABASE_PUBLISHABLE_KEY
- VITE_SUPABASE_URL

See .env.example for placeholders.

## Supabase backups (recommended)
- Enable daily backups: Supabase Dashboard → Project Settings → Database → Enable Point-in-Time Recovery (PITR) if on Pro plan, or use pg_dump scheduled backups.
- Test restore: Download a backup and verify you can restore to a test project.
- For free tier: Manually export via Dashboard → Database → Backups → Download (weekly recommended).

## Security headers (apply at reverse proxy / CDN when you add one)
- Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY (or SAMEORIGIN if you must embed yourself)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- Content-Security-Policy (tighten as needed):
	- default-src 'self';
	- script-src 'self';
	- style-src 'self' 'unsafe-inline';
	- img-src 'self' data: https:;
	- connect-src 'self' https://*.supabase.co;
	- font-src 'self' data:;
	- frame-ancestors 'none';
	- base-uri 'self'; form-action 'self';

Example (Nginx):
```
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
```
