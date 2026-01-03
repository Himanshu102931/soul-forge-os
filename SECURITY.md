# Security Policy & Architecture

## ✅ **RESOLVED: Server-Side AI Key Management**

**Status:** IMPLEMENTED ✅  
**Date:** January 2025

### What Changed

- **Before:** API keys encrypted client-side (AES-GCM), stored in localStorage
- **After:** API keys encrypted server-side, stored in Supabase database, accessed via Edge Function proxy

### Architecture

```
┌─────────────┐        ┌──────────────────┐        ┌─────────────┐
│   Client    │───────▶│  Edge Function   │───────▶│ AI Provider │
│ (no keys)   │ HTTPS  │ (decrypts keys)  │ HTTPS  │ (GPT/Gemini)│
└─────────────┘        └──────────────────┘        └─────────────┘
                             ▲
                             │ Encrypted keys
                             │ (AES-GCM-256)
                       ┌─────▼───────────┐
                       │  user_ai_config │
                       │  (RLS protected)│
                       └─────────────────┘
```

**Security Benefits:**
1. ✅ API keys NEVER sent to client
2. ✅ XSS attacks cannot steal keys
3. ✅ DevTools cannot inspect keys in memory
4. ✅ Server-side decryption using user.id as salt
5. ✅ RLS policies prevent cross-user access

---

## Current Security Measures

### 1. **Server-Side API Key Encryption (AES-GCM-256)**

**Implementation:**
- Edge Function: `supabase/functions/ai-proxy/index.ts`
- Database Table: `user_ai_config` with RLS
- Encryption: AES-GCM-256, PBKDF2 (100K iterations), user.id as salt
- Storage: Encrypted in PostgreSQL, never exposed to client

**How It Works:**
1. User enters API key in Settings → Encrypted client-side → Sent to database
2. Client requests AI feature → Calls Edge Function with auth token
3. Edge Function authenticates user → Fetches encrypted key from DB → Decrypts server-side
4. Edge Function calls AI provider → Returns response to client
5. API key never leaves server environment

**Migration:** `supabase/migrations/20260101000002_ai_proxy_tables.sql`

### 2. **Supabase Row Level Security (RLS)**

**Status:** ✅ Active  
**Coverage:** All tables (habits, tasks, daily_summaries, habit_logs, user_ai_config, etc.)

**How it works:**
- `VITE_SUPABASE_PUBLISHABLE_KEY` is intentionally public
- Security comes from RLS policies, not key secrecy
- Every query filtered by `auth.uid()` automatically
- Users can ONLY access their own data

**Verify RLS:**
```sql
**Verify RLS:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'habits';
SELECT * FROM pg_policies WHERE tablename = 'user_ai_config';
```

### 3. **Authentication**

- Supabase Auth (email + password)
- Passwords hashed with bcrypt server-side
- Session tokens in httpOnly cookies (managed by Supabase)
- Auto-refresh tokens prevent re-auth

**Planned Improvements:**
- ⏳ Password strength enforcement (12+ chars, complexity)
- ⏳ Optional 2FA/TOTP

### 4. **Security Headers**

**Status:** 📝 Documented (not yet enforced)

Required headers when deployed behind reverse proxy/CDN:
```nginx
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**To Apply:**
- Cloudflare: Transform Rules → Modify Response Header
- Nginx: `add_header` directives in server block
- Vercel/Netlify: `vercel.json` or `netlify.toml` headers section

---

## Edge Function Deployment

### Deploy AI Proxy to Supabase

1. **Install Supabase CLI:**
```bash
npm install -g supabase
supabase login
```

2. **Link to your project:**
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

3. **Deploy the Edge Function:**
```bash
supabase functions deploy ai-proxy
```

4. **Verify deployment:**
```bash
supabase functions list
```

5. **Test the function:**
```bash
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/ai-proxy \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"provider": "gemini", "prompt": "Hello"}'
```

---

## Threat Model

### In Scope
- ✅ Data access (RLS enforced)
- ✅ XSS (CSP mitigates; server-side keys eliminate client exposure)
- ✅ CSRF (Supabase uses SameSite cookies)
- ✅ Password security (bcrypt, planning complexity rules)
- ✅ API key theft (server-side storage, Edge Function proxy)

### Out of Scope
- ❌ Physical access to user device
- ❌ Compromised browser/OS
- ❌ Social engineering (phishing for credentials)

---

## Reporting a Vulnerability

**DO NOT** open public GitHub issues for security bugs.

**Email:** [Your email or security@yourdomain.com]

Include:
- Description of vulnerability
- Steps to reproduce
- Impact assessment
- Suggested fix (optional)

**Response SLA:** 48 hours acknowledgment, 7 days initial triage.

---

## Security Checklist (Deployment)

- [ ] RLS policies enabled on all tables
- [ ] Security headers applied (CSP, HSTS, XFO, etc.)
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] Supabase backups enabled (daily)
- [ ] AI API keys moved to Edge Function proxy (or disabled)
- [ ] Password complexity enforced (12+ chars)
- [ ] Optional: 2FA enabled for admin accounts
- [ ] Audit logs enabled (Supabase audit + app-level)
- [ ] Monitoring configured (Sentry for errors, Umami for analytics)
- [ ] Environment variables secured (GitHub Secrets, never in code)

---

## Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [MDN Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Content Security Policy Reference](https://content-security-policy.com/)
