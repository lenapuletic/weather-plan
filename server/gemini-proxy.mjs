#!/usr/bin/env node
/**
 * Keeps GEMINI_API_KEY on the server. The Angular app POSTs the same JSON body
 * Google expects to:
 *   POST {origin}/v1beta/models/{model}:generateContent
 * and this process forwards to generativelanguage.googleapis.com with ?key=...
 *
 * Run locally:
 *   GEMINI_API_KEY=... ALLOW_ORIGINS=http://localhost:4200 node server/gemini-proxy.mjs
 *
 * Deploy: see README (e.g. Render). Set GEMINI_API_KEY and ALLOW_ORIGINS (comma-separated).
 */
import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT) || 8787;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const UPSTREAM = 'https://generativelanguage.googleapis.com';

const allowOrigins = (process.env.ALLOW_ORIGINS || 'http://localhost:4200')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) {
    return false;
  }
  if (allowOrigins.includes('*')) {
    return true;
  }
  for (const pattern of allowOrigins) {
    if (pattern === origin) {
      return true;
    }
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      if (origin.startsWith(prefix)) {
        return true;
      }
    }
  }
  return false;
}

const MODEL_PATH =
  /^\/v1beta\/models\/([^/?#]+):generateContent$/;

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;

  if (req.method === 'OPTIONS') {
    if (!origin || !isOriginAllowed(origin)) {
      send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
      return;
    }
    send(res, 204, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    }, '');
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    send(res, 200, { 'Content-Type': 'text/plain' }, 'gemini-proxy ok\n');
    return;
  }

  if (req.method !== 'POST' || !req.url) {
    send(res, 404, { 'Content-Type': 'text/plain' }, 'Not found\n');
    return;
  }

  let pathname;
  try {
    pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
  } catch {
    send(res, 400, { 'Content-Type': 'text/plain' }, 'Bad URL\n');
    return;
  }

  const match = pathname.match(MODEL_PATH);
  if (!match) {
    send(res, 404, { 'Content-Type': 'text/plain' }, 'Not found\n');
    return;
  }

  if (!origin || !isOriginAllowed(origin)) {
    send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
    return;
  }

  if (!GEMINI_API_KEY) {
    send(res, 500, { 'Content-Type': 'application/json' }, JSON.stringify({ error: 'GEMINI_API_KEY is not set' }));
    return;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');

  const upstreamUrl = `${UPSTREAM}${pathname}?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  let upstreamRes;
  try {
    upstreamRes = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: rawBody || '{}',
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'upstream fetch failed';
    send(
      res,
      502,
      {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
      },
      JSON.stringify({ error: { message: msg } }),
    );
    return;
  }

  const text = await upstreamRes.text();
  const baseHeaders = {
    'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
    'Access-Control-Allow-Origin': origin,
  };

  res.writeHead(upstreamRes.status, baseHeaders);
  res.end(text);
});

server.listen(PORT, () => {
  console.log(`gemini-proxy listening on http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY is not set.');
  }
});
