/**
 * Cloudflare Pages Functions - /api/sync
 * Sincronização em Tempo Real Ultraleve
 */

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-cache, no-store, must-revalidate'
};

export async function onRequestOptions() {
  return new Response(null, { headers: JSON_HEADERS });
}

export async function onRequestGet({ env, request }) {
  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500, headers: JSON_HEADERS });
    }

    const url = new URL(request.url);
    const since = Number(url.searchParams.get('since') || 0);

    const metaRow = await db.prepare(
      `SELECT COALESCE(MAX(updated_at), 0) as last_updated, COUNT(*) as count FROM pacientes`
    ).first();

    const lastUpdated = Number(metaRow ? metaRow.last_updated : 0);
    const totalCount = Number(metaRow ? metaRow.count : 0);

    // Se nada mudou desde a última checagem do cliente, retorna payload minúsculo
    if (since > 0 && lastUpdated <= since) {
      return new Response(JSON.stringify({ changed: false, last_updated: lastUpdated, count: totalCount }), { headers: JSON_HEADERS });
    }

    // Se houve alterações, busca a lista atualizada
    const { results } = await db.prepare(
      `SELECT * FROM pacientes 
       ORDER BY CASE WHEN status = 'atendimento' THEN 0 ELSE 1 END, timestamp_criacao DESC`
    ).all();

    return new Response(JSON.stringify({
      changed: true,
      last_updated: lastUpdated || Date.now(),
      count: totalCount,
      pacientes: results || []
    }), { headers: JSON_HEADERS });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: JSON_HEADERS });
  }
}
