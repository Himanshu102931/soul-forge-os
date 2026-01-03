# Security Policy & Architecture

## Current Security Measures

### 1. **API Key Encryption (Web Crypto API AES-GCM)**

**Problem Solved:** Previous XOR "encryption" was trivially reversible.

**Current Implementation:**
- Uses Web Crypto API with AES-GCM-256
- Key derivation via PBKDF2 (100,000 iterations, SHA-256)
- Per-session salt (cleared on logout via sessionStorage)
- Random IV per encryption operation
- See `src/lib/encryption.ts`

**Limitations:**
- Client-side encryption still vulnerable to XSS attacks
- Attacker with DevTools access can extract keys from memory
- **NOT** a substitute for server-side key management

### 2. **Supabase Row Level Security (RLS)**

**Status:** ✅ Active  
**Coverage:** All tables (habits, tasks, daily_summaries, habit_logs, etc.)

**How it works:**
- `VITE_SUPABASE_PUBLISHABLE_KEY` is intentionally public
- Security comes from RLS policies, not key secrecy
- Every query filtered by `auth.uid()` automatically
- Users can ONLY access their own data

**Verify RLS:**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'habits';
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

## Known Vulnerabilities & Mitigation

### 🔴 **CRITICAL: AI API Keys Stored Client-Side**

**Risk:** XSS attack → key theft → unauthorized AI usage billed to your account

**Current Mitigation:**
- AES-GCM encryption (stronger than XOR)
- Per-session salt
- Keys cleared on logout

**Recommended Fix (Production):**

#### Option A: Supabase Edge Function Proxy (Best)

Create `supabase/functions/ai-proxy/index.ts`:
```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // Server-side key
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Fetch user's AI config from secure server-side table
  const { data: aiConfig } = await supabase
    .from('user_ai_keys') // New table with RLS
    .select('provider, encrypted_key')
    .eq('user_id', user.id)
    .single();

  // Decrypt key server-side (use Deno.env for master key)
  const apiKey = decryptKey(aiConfig.encrypted_key);

  // Forward request to AI provider
  const body = await req.json();
  const response = await fetch(`https://api.${aiConfig.provider}.com/...`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  return new Response(await response.text(), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

**Deploy:**
```bash
supabase functions deploy ai-proxy --no-verify-jwt
```

**Client-side change:**
```typescript
// Instead of direct AI API call
const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-proxy`, {
  headers: { 'Authorization': `Bearer ${session.access_token}` },
  body: JSON.stringify({ prompt: '...' }),
});
```

#### Option B: Disable AI Features for Production
If AI is not critical, disable and remove key storage entirely.

---

## Threat Model

### In Scope
- ✅ Data access (RLS enforced)
- ✅ XSS (CSP mitigates; client encryption is fallback)
- ✅ CSRF (Supabase uses SameSite cookies)
- ✅ Password security (bcrypt, planning complexity rules)

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
