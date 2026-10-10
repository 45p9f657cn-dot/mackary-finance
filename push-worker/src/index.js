import { buildPushPayload } from '@block65/webcrypto-web-push';

const encoder = new TextEncoder();
const datePattern = /^\\d{4}-\\d{2}-\\d{2}$/;
const allowedPushHost = host =>
  host === 'fcm.googleapis.com' ||
  host === 'web.push.apple.com' ||
  host.endsWith('.push.services.mozilla.com') ||
  host.endsWith('.notify.windows.com');

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin');
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };
  if (origin === env.APP_ORIGIN) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function response(request, env, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(request, env) });
}

async function hashToken(token) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(token));
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

function authorizedToken(request) {
  const value = request.headers.get('Authorization') || '';
  const match = /^Bearer ([a-f0-9]{64})$/i.exec(value);
  return match && match[1];
}

function validSubscription(subscription) {
  if (!subscription || typeof subscription !== 'object') return false;
  try {
    const endpoint = new URL(subscription.endpoint);
    return endpoint.protocol === 'https:' && allowedPushHost(endpoint.hostname) &&
      typeof subscription.keys?.p256dh === 'string' &&
      typeof subscription.keys?.auth === 'string';
  } catch {
    return false;
  }
}

function cleanPlan(value) {
  if (!Array.isArray(value) || value.length > 400) return null;
  const plan = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || !datePattern.test(item.remindOn)) return null;
    const id = String(item.id || '');
    const title = String(item.title || '').trim();
    const body = String(item.body || '').trim();
    if (!id || id.length > 100 || !title || title.length > 80 || !body || body.length > 180) return null;
    plan.push({ id, remindOn: item.remindOn, title, body });
  }
  return plan;
}

async function sendPush(subscription, title, body, env, tag = 'mackary-finance-reminder') {
  const message = {
    data: JSON.stringify({ title, body, tag, url: '/mackary-finance/' }),
    options: { ttl: 86400 },
  };
  const payload = await buildPushPayload(message, subscription, {
    subject: env.VAPID_SUBJECT,
    publicKey: env.VAPID_SERVER_PUBLIC_KEY,
    privateKey: env.VAPID_SERVER_PRIVATE_KEY,
  });
  return fetch(subscription.endpoint, payload);
}

async function handleRequest(request, env) {
  const origin = request.headers.get('Origin');
  if (origin !== env.APP_ORIGIN) return response(request, env, { error: 'Origin not allowed.' }, 403);
  const url = new URL(request.url);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });

  if (request.method === 'GET' && url.pathname === '/config') {
    if (!env.VAPID_SERVER_PUBLIC_KEY) return response(request, env, { error: 'Push service is not configured.' }, 503);
    return response(request, env, { publicKey: env.VAPID_SERVER_PUBLIC_KEY });
  }

  if (url.pathname === '/device' && request.method === 'POST') {
    const token = authorizedToken(request);
    if (!token) return response(request, env, { error: 'Device authorization is missing.' }, 401);
    const size = Number(request.headers.get('Content-Length') || 0);
    if (size > 50000) return response(request, env, { error: 'Reminder data is too large.' }, 413);
    let data;
    try { data = await request.json(); } catch { return response(request, env, { error: 'Invalid request.' }, 400); }
    const plan = cleanPlan(data.reminders);
    if (!validSubscription(data.subscription) || !plan) return response(request, env, { error: 'Invalid notification settings.' }, 400);
    const tokenHash = await hashToken(token);
    await env.DB.prepare('INSERT INTO devices (token_hash, subscription_json, reminder_plan_json, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(token_hash) DO UPDATE SET subscription_json=excluded.subscription_json, reminder_plan_json=excluded.reminder_plan_json, updated_at=excluded.updated_at')
      .bind(tokenHash, JSON.stringify(data.subscription), JSON.stringify(plan), Date.now()).run();
    await env.DB.prepare('DELETE FROM sent_reminders WHERE token_hash = ? AND sent_at < ?')
      .bind(tokenHash, Date.now() - 90 * 86400000).run();
    return response(request, env, { ok: true, reminders: plan.length });
  }

  if (url.pathname === '/device' && request.method === 'DELETE') {
    const token = authorizedToken(request);
    if (!token) return response(request, env, { error: 'Device authorization is missing.' }, 401);
    const tokenHash = await hashToken(token);
    await env.DB.prepare('DELETE FROM sent_reminders WHERE token_hash = ?').bind(tokenHash).run();
    await env.DB.prepare('DELETE FROM devices WHERE token_hash = ?').bind(tokenHash).run();
    return response(request, env, { ok: true });
  }

  if (url.pathname === '/test' && request.method === 'POST') {
    const token = authorizedToken(request);
    if (!token) return response(request, env, { error: 'Device authorization is missing.' }, 401);
    const tokenHash = await hashToken(token);
    const row = await env.DB.prepare('SELECT subscription_json FROM devices WHERE token_hash = ?').bind(tokenHash).first();
    if (!row) return response(request, env, { error: 'Enable phone reminders first.' }, 404);
    const result = await sendPush(JSON.parse(row.subscription_json), 'MACKARY FINANCE', 'Phone reminders are ready.', env, 'mackary-finance-test');
    if (result.status === 404 || result.status === 410) {
      await env.DB.prepare('DELETE FROM sent_reminders WHERE token_hash = ?').bind(tokenHash).run();
      await env.DB.prepare('DELETE FROM devices WHERE token_hash = ?').bind(tokenHash).run();
      return response(request, env, { error: 'This phone subscription expired. Enable reminders again.' }, 410);
    }
    if (!result.ok) return response(request, env, { error: 'The push service could not send a test notification.' }, 502);
    return response(request, env, { ok: true });
  }

  return response(request, env, { error: 'Not found.' }, 404);
}

function lusakaDate() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Africa/Lusaka', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = type => parts.find(part => part.type === type).value;
  return get('year') + '-' + get('month') + '-' + get('day');
}

async function sendDueReminders(env) {
  const today = lusakaDate();
  const { results = [] } = await env.DB.prepare('SELECT token_hash, subscription_json, reminder_plan_json FROM devices').all();
  for (const device of results) {
    let subscription;
    try { subscription = JSON.parse(device.subscription_json); } catch { continue; }
    let plan;
    try { plan = JSON.parse(device.reminder_plan_json); } catch { continue; }
    for (const reminder of plan.filter(item => item.remindOn === today)) {
      const alreadySent = await env.DB.prepare('SELECT 1 FROM sent_reminders WHERE token_hash = ? AND reminder_id = ? AND remind_on = ?')
        .bind(device.token_hash, reminder.id, today).first();
      if (alreadySent) continue;
      try {
        const result = await sendPush(subscription, reminder.title, reminder.body, env, reminder.id);
        if (result.status === 404 || result.status === 410) {
          await env.DB.prepare('DELETE FROM sent_reminders WHERE token_hash = ?').bind(device.token_hash).run();
          await env.DB.prepare('DELETE FROM devices WHERE token_hash = ?').bind(device.token_hash).run();
          break;
        }
        if (result.ok) {
          await env.DB.prepare('INSERT OR IGNORE INTO sent_reminders (token_hash, reminder_id, remind_on, sent_at) VALUES (?, ?, ?, ?)')
            .bind(device.token_hash, reminder.id, today, Date.now()).run();
        } else {
          console.error('Push provider returned status', result.status);
        }
      } catch (error) {
        console.error('Could not send reminder', error && error.message);
      }
    }
  }
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      console.error('Reminder service error', error && error.message);
      return response(request, env, { error: 'Reminder service error.' }, 500);
    }
  },
  async scheduled(_controller, env, context) {
    context.waitUntil(sendDueReminders(env));
  },
};
