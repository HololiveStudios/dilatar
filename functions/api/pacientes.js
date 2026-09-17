/**
 * Cloudflare Pages Functions - /api/pacientes
 * Suporte completo a CRUD com Cloudflare D1
 */

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

    const { results } = await db.prepare(
      `SELECT * FROM pacientes 
       ORDER BY CASE WHEN status = 'atendimento' THEN 0 ELSE 1 END, timestamp_criacao DESC`
    ).all();

    return new Response(JSON.stringify(results || []), { headers: JSON_HEADERS });
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

    const p = await request.json();
    const agora = Date.now();

    await db.prepare(
      `INSERT OR REPLACE INTO pacientes (
        id, nome, idade, tipo, tipoExame, periodo, olhos,
        etapa, status, timestamp_criacao, timestamp_gota1,
        timestamp_gota2, timestamp_finalizado, pressaoOcularOD,
        pressaoOcularOE, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      p.id,
      p.nome || '',
      p.idade !== undefined && p.idade !== null && p.idade !== '' ? Number(p.idade) : null,
      p.tipo || 'consulta',
      p.tipoExame || '',
      p.periodo || '',
      p.olhos || '',
      p.etapa || 1,
      p.status || 'atendimento',
      p.timestamp_criacao || agora,
      p.timestamp_gota1 || null,
      p.timestamp_gota2 || null,
      p.timestamp_finalizado || null,
      p.pressaoOcularOD || '',
      p.pressaoOcularOE || '',
      agora
    ).run();

    return new Response(JSON.stringify({ success: true, id: p.id, updated_at: agora }), { headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: JSON_HEADERS });
  }
}

export async function onRequestPut({ env, request }) {
  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500, headers: JSON_HEADERS });
    }

    const p = await request.json();
    const agora = Date.now();

    await db.prepare(
      `UPDATE pacientes SET 
        nome = ?, idade = ?, tipo = ?, tipoExame = ?, periodo = ?, olhos = ?,
        etapa = ?, status = ?, timestamp_gota1 = ?, timestamp_gota2 = ?,
        timestamp_finalizado = ?, pressaoOcularOD = ?, pressaoOcularOE = ?,
        updated_at = ?
       WHERE id = ?`
    ).bind(
      p.nome || '',
      p.idade !== undefined && p.idade !== null && p.idade !== '' ? Number(p.idade) : null,
      p.tipo || 'consulta',
      p.tipoExame || '',
      p.periodo || '',
      p.olhos || '',
      p.etapa || 1,
      p.status || 'atendimento',
      p.timestamp_gota1 || null,
      p.timestamp_gota2 || null,
      p.timestamp_finalizado || null,
      p.pressaoOcularOD || '',
      p.pressaoOcularOE || '',
      agora,
      p.id
    ).run();

    return new Response(JSON.stringify({ success: true, updated_at: agora }), { headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: JSON_HEADERS });
  }
}

export async function onRequestDelete({ env, request }) {
  try {
    const db = env.DB;
    if (!db) {
      return new Response(JSON.stringify({ error: 'Database binding missing' }), { status: 500, headers: JSON_HEADERS });
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const id = url.searchParams.get('id');
    const agora = Date.now();

    if (action === 'limpar_finalizados') {
      await db.prepare(`DELETE FROM pacientes WHERE status = 'finalizado'`).run();
    } else if (action === 'limpar_todos') {
      await db.prepare(`DELETE FROM pacientes`).run();
    } else if (id) {
      await db.prepare(`DELETE FROM pacientes WHERE id = ?`).bind(id).run();
    } else {
      return new Response(JSON.stringify({ error: 'Parâmetro de exclusão ausente' }), { status: 400, headers: JSON_HEADERS });
    }

    return new Response(JSON.stringify({ success: true, updated_at: agora }), { headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: JSON_HEADERS });
  }
}
