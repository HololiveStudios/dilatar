/**
 * Cloudflare Pages Functions - /api/config
 * Armazenamento de médicos e protocolos clínicos no Cloudflare D1
 */

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

export async function onRequestOptions() {
  return new Response(null, { headers: JSON_HEADERS });
}

export async function onRequestGet({ env }) {
  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500, headers: JSON_HEADERS });
    }

    const { results } = await db.prepare(`SELECT chave, valor, updated_at FROM clinica_config`).all();
    const configMap = {};
    if (results) {
      for (const row of results) {
        try {
          configMap[row.chave] = JSON.parse(row.valor);
        } catch (e) {
          configMap[row.chave] = row.valor;
        }
      }
    }

    return new Response(JSON.stringify(configMap), { headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: JSON_HEADERS });
  }
}

export async function onRequestPost({ env, request }) {
  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500, headers: JSON_HEADERS });
    }

    const payload = await request.json();
    const agora = Date.now();

    for (const [chave, valor] of Object.entries(payload)) {
      const valorStr = typeof valor === 'string' ? valor : JSON.stringify(valor);
      await db.prepare(
        `INSERT OR REPLACE INTO clinica_config (chave, valor, updated_at) VALUES (?, ?, ?)`
      ).bind(chave, valorStr, agora).run();
    }

    return new Response(JSON.stringify({ success: true, updated_at: agora }), { headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: JSON_HEADERS });
  }
}
