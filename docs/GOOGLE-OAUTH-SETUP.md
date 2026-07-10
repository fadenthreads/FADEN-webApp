# Google Sign-In Setup (Free)

FADEN uses Supabase Auth for Google OAuth. Supabase and Google Cloud OAuth are free at development scale.

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or pick an existing one).
3. Go to **APIs & Services → OAuth consent screen**.
   - User type: **External**
   - App name: `FADEN`
   - Add your support email
   - Scopes: keep defaults (`email`, `profile`, `openid`)
   - Add test users while in "Testing" mode (or publish the app when ready)
4. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   - Application type: **Web application**
   - Name: `FADEN Supabase`
   - **Authorized redirect URIs** — add exactly:
     ```
     https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback
     ```
     Replace `YOUR-PROJECT-REF` with your Supabase project ref (from the Supabase dashboard URL).
5. Copy the **Client ID** and **Client secret**.

## 2. Supabase Dashboard

1. Open your project → **Authentication → Providers → Google**.
2. Enable Google.
3. Paste the **Client ID** and **Client secret** from Google.
4. Save.

## 3. Supabase URL configuration

**Authentication → URL Configuration**

| Field | Local dev | Production |
|-------|-----------|------------|
| Site URL | `http://localhost:3000` | `https://your-domain.com` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://your-domain.com/auth/callback` |
| | `http://localhost:3000/**` | `https://your-domain.com/**` |

Add admin URLs too if you use Google on admin (`http://localhost:3001/auth/callback`, etc.).

## 4. Local env

Ensure `apps/web/.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Restart the dev server after changing env vars.

## 5. Test

1. Run `pnpm dev`
2. Open `http://localhost:3000/login`
3. Click **Continue with Google**
4. You should return to `/auth/callback` and land signed in

## Troubleshooting

| Error | Fix |
|-------|-----|
| `redirect_uri_mismatch` | Redirect URI in Google must match Supabase callback exactly |
| `auth_callback` on return | Check Supabase URL config; ensure `/auth/callback` is allowed |
| Button does nothing | Confirm Supabase env vars are set; check browser console |
| Google shows "app not verified" | Normal in Testing mode — add your email as a test user |
