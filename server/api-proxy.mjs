#!/usr/bin/env node
/**
 * Keeps GEMINI_API_KEY and OPENWEATHER_API_KEY on the server.
 *
 * Supported routes:
 * - POST /v1beta/models/{model}:generateContent           (Gemini)
 * - GET  /openweather/geo/1.0/direct                      (OpenWeather geocoding)
 * - GET  /openweather/data/2.5/weather                    (OpenWeather current weather)
 * - GET  /openweather/data/2.5/forecast                   (OpenWeather forecast)
 *
 * Run locally:
 *   GEMINI_API_KEY=... OPENWEATHER_API_KEY=... ALLOW_ORIGINS=http://localhost:4200 node server/api-proxy.mjs
 *
 * Deploy: set GEMINI_API_KEY, OPENWEATHER_API_KEY, and ALLOW_ORIGINS.
 */
import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT) || 8787;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY?.trim();
const GEMINI_UPSTREAM = 'https://generativelanguage.googleapis.com';
const OPENWEATHER_UPSTREAM = 'https://api.openweathermap.org';

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

const MODEL_PATH = /^\/v1beta\/models\/([^/?#]+):generateContent$/;
const OPENWEATHER_PATH =
  /^\/openweather\/(geo\/1\.0\/direct|data\/2\.5\/weather|data\/2\.5\/forecast)$/;

function send(res, status, headers, body) {
  res.writeHead(status, headers);
  res.end(body);
}

function withCors(origin, headers = {}) {
  return {
    ...headers,
    'Access-Control-Allow-Origin': origin,
  };
}

async function pipeUpstreamResponse(res, origin, upstreamRes) {
  const text = await upstreamRes.text();
  res.writeHead(
    upstreamRes.status,
    withCors(origin, {
      'Content-Type': upstreamRes.headers.get('content-type') || 'application/json',
    }),
  );
  res.end(text);
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;

  if (req.method === 'OPTIONS') {
    if (!origin || !isOriginAllowed(origin)) {
      send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
      return;
    }
    send(
      res,
      204,
      {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
      '',
    );
    return;
  }

  if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
    send(res, 200, { 'Content-Type': 'text/plain' }, 'api-proxy ok\n');
    return;
  }

  if (!req.url) {
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

  if (!origin || !isOriginAllowed(origin)) {
    send(res, 403, { 'Content-Type': 'text/plain' }, 'Forbidden');
    return;
  }

  const geminiMatch = pathname.match(MODEL_PATH);
  const openWeatherMatch = pathname.match(OPENWEATHER_PATH);

  if (geminiMatch) {
    if (req.method !== 'POST') {
      send(res, 405, withCors(origin, { 'Content-Type': 'text/plain' }), 'Method Not Allowed\n');
      return;
    }
    if (!GEMINI_API_KEY) {
      send(
        res,
        500,
        withCors(origin, { 'Content-Type': 'application/json' }),
        JSON.stringify({ error: 'GEMINI_API_KEY is not set' }),
      );
      return;
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString('utf8');

    const upstreamUrl = `${GEMINI_UPSTREAM}${pathname}?key=${encodeURIComponent(GEMINI_API_KEY)}`;
    try {
      const upstreamRes = await fetch(upstreamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: rawBody || '{}',
      });
      await pipeUpstreamResponse(res, origin, upstreamRes);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'upstream fetch failed';
      send(
        res,
        502,
        withCors(origin, { 'Content-Type': 'application/json' }),
        JSON.stringify({ error: { message: msg } }),
      );
    }
    return;
  }

  if (openWeatherMatch) {
    if (req.method !== 'GET') {
      send(res, 405, withCors(origin, { 'Content-Type': 'text/plain' }), 'Method Not Allowed\n');
      return;
    }
    if (!OPENWEATHER_API_KEY) {
      send(
        res,
        500,
        withCors(origin, { 'Content-Type': 'application/json' }),
        JSON.stringify({ error: 'OPENWEATHER_API_KEY is not set' }),
      );
      return;
    }

    const upstreamPath = `/${openWeatherMatch[1]}`;
    const incoming = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const params = new URLSearchParams(incoming.searchParams);
    params.set('appid', OPENWEATHER_API_KEY);
    const upstreamUrl = `${OPENWEATHER_UPSTREAM}${upstreamPath}?${params.toString()}`;

    try {
      const upstreamRes = await fetch(upstreamUrl, { method: 'GET' });
      await pipeUpstreamResponse(res, origin, upstreamRes);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'upstream fetch failed';
      send(
        res,
        502,
        withCors(origin, { 'Content-Type': 'application/json' }),
        JSON.stringify({ error: { message: msg } }),
      );
    }
    return;
  }

  send(res, 404, withCors(origin, { 'Content-Type': 'text/plain' }), 'Not found\n');
});

server.listen(PORT, () => {
  console.log(`api-proxy listening on http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.warn('Warning: GEMINI_API_KEY is not set.');
  }
  if (!OPENWEATHER_API_KEY) {
    console.warn('Warning: OPENWEATHER_API_KEY is not set.');
  }
});
