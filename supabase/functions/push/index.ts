// Fastaqim reminders that arrive when the site is closed (free: Supabase Edge Function + pg_cron, Web Push).
//  GET  ?key=1           -> the public VAPID key the browser needs to subscribe
//  POST (x-cron header)  -> every minute: send reminders that are due, then mark them sent
// Keys are made on first use and kept in public.push_cfg (no one can read that table from the site).
import { newVapid, send, vapidPublic } from "./wp.js";

const SB = Deno.env.get("SUPABASE_URL")!;
function secretKey(): string {
  const k = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (k) return k;
  try { const j = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"); return j.default || Object.values(j)[0] as string || ""; } catch (_) { return ""; }
}
const KEY = secretKey();
const H: Record<string, string> = { apikey: KEY, "Content-Type": "application/json" };
if (KEY.startsWith("eyJ")) H.Authorization = "Bearer " + KEY;
const CONTACT = "https://alfirdows.github.io/fastaqim";
type Row = { id: number; user_id: string; title: string; body: string; tag: string; url: string; ref?: string; rep?: number; left_n?: number };
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" };

async function db(path: string, opt: RequestInit = {}) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { ...opt, headers: { ...H, ...(opt.headers as Record<string, string> || {}) } });
  const t = await r.text();
  if (!r.ok) throw new Error(`${path.split("?")[0]} ${r.status} ${t}`);
  return t ? JSON.parse(t) : null;
}
async function cfg(k: string): Promise<string | null> {
  const r = await db(`push_cfg?k=eq.${k}&select=v`);
  return r && r[0] ? r[0].v : null;
}
async function vapid() {
  let v = await cfg("vapid");
  if (!v) {
    await db("push_cfg", { method: "POST", headers: { Prefer: "resolution=ignore-duplicates" }, body: JSON.stringify({ k: "vapid", v: JSON.stringify(await newVapid()) }) });
    v = await cfg("vapid"); // re-read so two first calls agree on one key
  }
  return JSON.parse(v!);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    if (req.method === "GET") {
      return Response.json({ key: vapidPublic(await vapid()) }, { headers: CORS });
    }
    const want = await cfg("cron");
    if (!want || req.headers.get("x-cron") !== want) return new Response("no", { status: 401, headers: CORS });
    const jwk = await vapid();
    const now = new Date().toISOString(), old = new Date(Date.now() - 30 * 60000).toISOString();
    // due in the last 30 minutes and not sent yet (older ones are dropped, never sent late)
    const q = `push_queue?sent=eq.false&at=lte.${now}&at=gte.${old}&order=at.asc&limit=500&select=id,user_id,title,body,tag,url`;
    // snooze columns (ref, rep, left_n) exist once the snooze setup has run; work without them too
    let due: Row[], snooze = true;
    try { due = await db(q + ",ref,rep,left_n"); } catch (_) { snooze = false; due = await db(q); }
    let sent = 0, gone = 0;
    if (due.length) {
      const users = [...new Set(due.map((d) => d.user_id))];
      const subs = await db(`push_subs?user_id=in.(${users.join(",")})&select=endpoint,user_id,p256dh,auth`);
      for (const d of due) {
        for (const s of subs.filter((x: { user_id: string }) => x.user_id === d.user_id)) {
          try {
            const st = await send(s, { title: d.title, body: d.body || "", tag: d.tag || "fq", url: d.url || "./", ref: d.ref || "" }, jwk, CONTACT);
            if (st === 404 || st === 410) { gone++; await db(`push_subs?endpoint=eq.${encodeURIComponent(s.endpoint)}`, { method: "DELETE" }); }
            else if (st < 300) sent++;
          } catch (_) { /* one bad subscription never stops the rest */ }
        }
      }
      // snoozed or "repeat until done": queue the next one until the person taps Done (Done deletes it)
      const again = snooze ? due.filter((d) => (d.rep || 0) > 0 && (d.left_n || 0) > 0) : [];
      if (again.length) {
        await db("push_queue", { method: "POST", body: JSON.stringify(again.map((d) => ({
          user_id: d.user_id, at: new Date(Date.now() + Math.min(720, d.rep!) * 60000).toISOString(), title: d.title, body: d.body || "",
          tag: d.tag || "fq", url: d.url || "./", ref: d.ref || "", rep: d.rep, left_n: d.left_n! - 1, keep: true,
        }))) });
      }
      await db(`push_queue?id=in.(${due.map((d) => d.id).join(",")})`, { method: "PATCH", body: JSON.stringify({ sent: true }) });
    }
    // tidy: forget sent or stale rows older than 2 days
    await db(`push_queue?at=lt.${new Date(Date.now() - 2 * 864e5).toISOString()}`, { method: "DELETE" });
    return Response.json({ due: due.length, sent, gone }, { headers: CORS });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500, headers: CORS });
  }
});
