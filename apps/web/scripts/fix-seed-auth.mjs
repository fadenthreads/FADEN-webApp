/**
 * Repair + verify seed boutique owner logins.
 * Run from apps/web: pnpm fix:seed-auth
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY to reset passwords via Admin API,
 * then tests email/password sign-in with the anon key.
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PASSWORD = "SeedPass123!";

const SEED_OWNERS = [
  { email: "lakshmi.stitches@seed.faden.test", fullName: "Lakshmi Reddy" },
  { email: "royal.threads@seed.faden.test", fullName: "Priya Sharma" },
  { email: "saree.sabha@seed.faden.test", fullName: "Meena Iyer" },
  { email: "gown.gallery@seed.faden.test", fullName: "Ananya Kapoor" },
  { email: "sharara.house@seed.faden.test", fullName: "Fatima Khan" },
  { email: "silk.route@seed.faden.test", fullName: "Sunita Agarwal" },
  { email: "bridal.bloom@seed.faden.test", fullName: "Kavya Nair" },
  { email: "anarkali.atelier@seed.faden.test", fullName: "Zara Ahmed" },
  { email: "fusion.faden@seed.faden.test", fullName: "Rhea Malhotra" },
  { email: "heritage.weaves@seed.faden.test", fullName: "Deepa Choudhary" },
];

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

function adminHeaders(serviceRoleKey) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "Content-Type": "application/json",
  };
}

function anonHeaders(anonKey) {
  return {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
  };
}

async function findUserByEmail(url, serviceRoleKey, email) {
  let page = 1;
  while (page <= 20) {
    const res = await fetch(`${url}/auth/v1/admin/users?page=${page}&per_page=200`, {
      headers: adminHeaders(serviceRoleKey),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.msg ?? body.message ?? "listUsers failed");
    const users = body.users ?? [];
    const match = users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;
    if (users.length < 200) break;
    page += 1;
  }
  return null;
}

async function updateUserPassword(url, serviceRoleKey, userId, owner) {
  const res = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: adminHeaders(serviceRoleKey),
    body: JSON.stringify({
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: owner.fullName, role: "boutique_owner" },
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.msg ?? body.message ?? "updateUser failed");
}

async function signIn(url, anonKey, email) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: anonHeaders(anonKey),
    body: JSON.stringify({ email, password: PASSWORD }),
  });
  const body = await res.json();
  if (!res.ok) return { ok: false, error: body.msg ?? body.error_description ?? "sign in failed" };
  return { ok: Boolean(body.access_token), error: null };
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error("FAIL: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error("FAIL: missing SUPABASE_SERVICE_ROLE_KEY in apps/web/.env.local");
  console.error("Add it, then re-run. Also run packages/database/src/schema/011_fix_seed_auth.sql in Supabase.");
  process.exit(1);
}

console.log("Repairing seed owner auth...\n");

let ok = 0;
let failed = 0;

for (const owner of SEED_OWNERS) {
  process.stdout.write(`${owner.email} ... `);

  let existing;
  try {
    existing = await findUserByEmail(url, serviceRoleKey, owner.email);
  } catch (err) {
    console.log(`LIST FAIL: ${err.message}`);
    failed += 1;
    continue;
  }

  if (!existing) {
    console.log("MISSING — run 010_seed_hyderabad_boutiques.sql first");
    failed += 1;
    continue;
  }

  try {
    await updateUserPassword(url, serviceRoleKey, existing.id, owner);
  } catch (err) {
    console.log(`UPDATE FAIL: ${err.message}`);
    failed += 1;
    continue;
  }

  const signInResult = await signIn(url, anonKey, owner.email);
  if (!signInResult.ok) {
    console.log(`SIGN-IN FAIL: ${signInResult.error}`);
    console.log("  → Run packages/database/src/schema/011_fix_seed_auth.sql in Supabase SQL Editor");
    failed += 1;
    continue;
  }

  console.log("OK");
  ok += 1;
}

console.log(`\nDone: ${ok} ok, ${failed} failed`);
if (failed > 0) {
  console.log("\nIf sign-in still fails, run 011_fix_seed_auth.sql — it recreates auth.identities rows.");
  process.exit(1);
}

console.log("\nAll seed owners can sign in with password:", PASSWORD);
