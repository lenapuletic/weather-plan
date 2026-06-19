#!/usr/bin/env node
/**
 * Runs the local API proxy and Angular dev server together.
 * Requires OPENWEATHER_API_KEY in the environment for city search / weather calls.
 */
import { spawn } from 'node:child_process';

const env = {
  ...process.env,
  PORT: '8787',
  ALLOW_ORIGINS: process.env.ALLOW_ORIGINS || 'http://localhost:4200',
};

if (!env.OPENWEATHER_API_KEY?.trim()) {
  console.warn(
    'Warning: OPENWEATHER_API_KEY is not set. Start the proxy with your key, e.g.\n' +
      '  OPENWEATHER_API_KEY=your_key npm start',
  );
}

const proxy = spawn('node', ['server/api-proxy.mjs'], {
  env,
  stdio: 'inherit',
});

const ng = spawn('npx', ['ng', 'serve'], {
  env,
  stdio: 'inherit',
  shell: true,
});

function shutdown(code = 0) {
  proxy.kill('SIGTERM');
  ng.kill('SIGTERM');
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

proxy.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`api-proxy exited with code ${code}`);
    shutdown(code);
  }
});

ng.on('exit', (code) => {
  shutdown(code ?? 0);
});
