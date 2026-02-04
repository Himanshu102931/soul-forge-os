# Soul Forge OS

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/Himanshu102931/soul-forge-os/CI)
![GitHub last commit](https://img.shields.io/github/last-commit/Himanshu102931/soul-forge-os)
![GitHub license](https://img.shields.io/github/license/Himanshu102931/soul-forge-os)

**A modern productivity and habit-tracking app built with React, Vite, Supabase, and Tailwind CSS.**


## Project Info

**Live Demo:** [Soul Forge OS on GitHub Pages](https://himanshu102931.github.io/soul-forge-os/)

**Project Board:** [Lovable Project](https://lovable.dev/projects/8f0c54c3-ed54-4412-9b44-d47918410688)


## Getting Started

### Local Development

1. **Clone the repository:**
	```sh
	git clone https://github.com/Himanshu102931/soul-forge-os.git
	cd soul-forge-os
	```
2. **Install dependencies:**
	```sh
	npm install
	```
3. **Start the development server:**
	```sh
	npm run dev
	```

### GitHub Codespaces
You can also use GitHub Codespaces for instant cloud development.

### Edit in GitHub
You can edit files directly in the GitHub web UI and commit changes.


## Tech Stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Edge Functions)


## CI/CD & Deployment

- **CI:** Runs on push/PR: `npm test`, `tsc --noEmit`, `npm run lint`, `npm run build`
- **Deployment:** [GitHub Pages](https://himanshu102931.github.io/soul-forge-os/) via `.github/workflows/deploy.yml`
- **Secrets:** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in GitHub Actions

## Supabase Edge Functions (AI Proxy)

**Why:** Secure server-side API key management. AI keys never exposed to client.

**Setup:**
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase functions deploy ai-proxy
supabase functions list
```

**Required:**
- Edge Function: `supabase/functions/ai-proxy/index.ts` ✅
- Database Migration: `supabase/migrations/20260101000002_ai_proxy_tables.sql` ✅

**Apply Migration:**
```bash
supabase db push
```

**Test Edge Function:**
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/ai-proxy \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider": "gemini", "prompt": "Hello", "maxTokens": 50}'
```

## Environment Variables

- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

See `.env.example` for placeholders.

## Backups & Security

- Enable daily backups in Supabase dashboard (recommended)
- Test restores regularly
- Use strong security headers (see example in repo)

## License

This project is licensed under the [MIT License](LICENSE).
