/* ============================================================
   Worker Cloudflare — proxy pour "La Boîte à Mots" d'Opération Lille.
   Stocke les messages dans Cloudflare KV. Ne renvoie jamais de secret
   au client : le token GitHub n'existe plus côté navigateur.

   Bindings à configurer dans le dashboard Cloudflare (Settings > Variables) :
     - KV namespace lié sous le nom "MESSAGES_KV"
     - Variable secrète "APP_KEY" : clé partagée simple anti-spam
       (pas un identifiant sensible, juste pour éviter qu'un inconnu
       qui tomberait sur l'URL du Worker ne remplisse la boîte de spam)
     - Variable "ALLOWED_ORIGIN" : ex. https://ewn0.github.io
   ============================================================ */

const MESSAGES_KEY = 'messages';
const MAX_TEXT_LEN = 280;

// Historique déjà échangé avant la migration vers ce Worker — sert
// uniquement à amorcer le KV au tout premier appel (KV vide).
const SEED_MESSAGES = [
  { "id": "1785852424666", "author": "ewn", "name": "Ewan", "text": "Je tiens énormément à toi <3", "date": "04/08/2026 16:07" },
  { "id": "1785855258512", "author": "elise", "name": "Élise", "text": "j’ai hâte de t’avoir près de moi 🤍", "date": "04/08/2026 16:54" },
  { "id": "1785858958500", "author": "ewn", "name": "Ewan", "text": "Tu me manques", "date": "04/08/2026 17:55" }
];

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-App-Key',
  };
}

function json(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

async function readMessages(env) {
  const raw = await env.MESSAGES_KV.get(MESSAGES_KEY);
  if (raw === null) {
    // Premier appel jamais fait : on amorce le stockage avec l'historique connu.
    await writeMessages(env, SEED_MESSAGES);
    return SEED_MESSAGES;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

async function writeMessages(env, messages) {
  await env.MESSAGES_KV.put(MESSAGES_KEY, JSON.stringify(messages));
}

function checkAppKey(request, env) {
  if (!env.APP_KEY) return true;
  return request.headers.get('X-App-Key') === env.APP_KEY;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) });
    }

    if (url.pathname === '/messages' && request.method === 'GET') {
      const messages = await readMessages(env);
      return json(messages, 200, env);
    }

    if (url.pathname === '/messages' && request.method === 'POST') {
      if (!checkAppKey(request, env)) return json({ error: 'forbidden' }, 403, env);

      let body;
      try {
        body = await request.json();
      } catch (e) {
        return json({ error: 'invalid body' }, 400, env);
      }

      const author = body.author === 'ewn' || body.author === 'elise' ? body.author : null;
      const text = typeof body.text === 'string' ? body.text.trim().slice(0, MAX_TEXT_LEN) : '';
      if (!author || !text) return json({ error: 'invalid payload' }, 400, env);

      const now = new Date();
      const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newMsg = {
        id: Date.now().toString(),
        author,
        name: author === 'ewn' ? 'Ewan' : 'Élise',
        text,
        date: dateStr,
      };

      const messages = await readMessages(env);
      messages.push(newMsg);
      await writeMessages(env, messages);

      return json(messages, 200, env);
    }

    if (url.pathname === '/purge' && request.method === 'POST') {
      if (!checkAppKey(request, env)) return json({ error: 'forbidden' }, 403, env);
      await writeMessages(env, []);
      return json([], 200, env);
    }

    return json({ error: 'not found' }, 404, env);
  },
};
