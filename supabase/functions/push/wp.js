// Web Push (RFC 8291 aes128gcm + RFC 8292 VAPID) with WebCrypto only: no paid service, no extra library.
const te = new TextEncoder();
export const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export const unb64u = (s) => { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); };
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };
async function hkdf(salt, ikm, info, len) {
  const k = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, k, len * 8));
}

// VAPID keys: kept as a private JWK; the public key is the raw 65-byte point (0x04 || x || y)
export async function newVapid() {
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  return await crypto.subtle.exportKey("jwk", kp.privateKey);
}
export const vapidPublic = (jwk) => b64u(cat(new Uint8Array([4]), unb64u(jwk.x), unb64u(jwk.y)));

async function vapidAuth(jwk, endpoint, sub) {
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const aud = new URL(endpoint).origin, exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const unsigned = b64u(te.encode(JSON.stringify({ typ: "JWT", alg: "ES256" }))) + "." + b64u(te.encode(JSON.stringify({ aud, exp, sub })));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, te.encode(unsigned));
  return `vapid t=${unsigned}.${b64u(sig)}, k=${vapidPublic(jwk)}`;
}

// encrypt one message for one browser subscription
export async function encrypt(p256dh, authSecret, text) {
  const ua = unb64u(p256dh), auth = unb64u(authSecret);
  const as = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(auth, shared, cat(te.encode("WebPush: info\0"), ua, asPub), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, te.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, te.encode("Content-Encoding: nonce\0"), 12);
  const k = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, k, cat(te.encode(text), new Uint8Array([2]))));
  const rs = new Uint8Array(4); new DataView(rs.buffer).setUint32(0, 4096);
  return cat(salt, rs, new Uint8Array([65]), asPub, ct);
}

// send; returns the HTTP status (404/410 = the subscription is gone)
export async function send(sub, payload, jwk, contact, ttl = 6 * 3600) {
  const body = await encrypt(sub.p256dh, sub.auth, JSON.stringify(payload));
  const r = await fetch(sub.endpoint, {
    method: "POST",
    headers: { Authorization: await vapidAuth(jwk, sub.endpoint, contact), "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: String(ttl), Urgency: "high" },
    body,
  });
  try { await r.arrayBuffer(); } catch (_) { /* ignore */ }
  return r.status;
}
