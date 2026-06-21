/**
 * Auth smoke test — run from apps/web: pnpm test:auth
 * Creates a throwaway user, signs in, verifies session + profile row.
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) throw new Error("Missing apps/web/.env.local");
  const text = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("FAIL: missing SUPABASE env vars");
  process.exit(1);
}

const authHeaders = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

const testEmail = `faden-test-${Date.now()}@example.com`;
const testPassword = "TestPass123!";
const testName = "FADEN Test User";

console.log("URL:", url);
console.log("Key prefix:", key.slice(0, 20) + "...");
console.log("\n1. Sign up...", testEmail);

const signUpRes = await fetch(`${url}/auth/v1/signup`, {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({
    email: testEmail,
    password: testPassword,
    data: { full_name: testName, role: "customer" },
  }),
});

const signUpBody = await signUpRes.json();
if (!signUpRes.ok) {
  console.error("FAIL signUp:", signUpBody.msg ?? signUpBody.error_description ?? signUpBody);
  process.exit(1);
}

console.log("   signUp OK, session:", Boolean(signUpBody.access_token));
console.log("   user id:", signUpBody.user?.id ?? "none");

console.log("\n2. Sign in...");
const signInRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({ email: testEmail, password: testPassword }),
});

const signInBody = await signInRes.json();
if (!signInRes.ok) {
  console.error("FAIL signIn:", signInBody.msg ?? signInBody.error_description ?? signInBody);
  process.exit(1);
}

console.log("   signIn OK, session:", Boolean(signInBody.access_token));
console.log("   access_token length:", signInBody.access_token?.length ?? 0);

console.log("\n3. getUser with token...");
const userRes = await fetch(`${url}/auth/v1/user`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${signInBody.access_token}`,
  },
});

const userBody = await userRes.json();
if (!userRes.ok) {
  console.error("FAIL getUser:", userBody.msg ?? userBody);
  process.exit(1);
}
console.log("   getUser OK:", userBody.email);

console.log("\n4. Check profiles row...");
const profileRes = await fetch(
  `${url}/rest/v1/profiles?id=eq.${userBody.id}&select=email,full_name,role`,
  {
    headers: {
      apikey: key,
      Authorization: `Bearer ${signInBody.access_token}`,
    },
  },
);

const profileRows = await profileRes.json();
if (!profileRes.ok) {
  console.error("FAIL profiles:", profileRows.message ?? profileRows);
  process.exit(1);
}
console.log("   profile:", profileRows[0] ?? "NOT FOUND (run 002_fix_profiles_trigger.sql)");

console.log("\n✅ Auth smoke test passed");
