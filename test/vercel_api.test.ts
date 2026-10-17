import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import type {Server} from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

test('Vercel API handler persists local state and requires Postgres in Vercel', async () => {
  const previousEnvironment = {
    databaseUrl: process.env.DATABASE_URL,
    postgresUrl: process.env.POSTGRES_URL,
    vercel: process.env.VERCEL,
    dataDirectory: process.env.SKILLTRACE_DATA_DIR,
  };
  const dataDirectory = await mkdtemp(path.join(os.tmpdir(), 'skilltrace-vercel-api-'));

  delete process.env.DATABASE_URL;
  delete process.env.POSTGRES_URL;
  delete process.env.VERCEL;
  process.env.SKILLTRACE_DATA_DIR = dataDirectory;

  let server: Server | undefined;
  try {
    const {default: app} = await import('../api/[...path].ts');
    server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve, reject) => {
      server?.once('listening', resolve);
      server?.once('error', reject);
    });

    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const stateResponse = await fetch(`${baseUrl}/api/state`);
    assert.equal(stateResponse.status, 200);
    assert.equal((await stateResponse.json()).resume, null);

    const seedResponse = await fetch(`${baseUrl}/api/seed-sample`, {method: 'POST'});
    assert.equal(seedResponse.status, 200);
    assert.equal((await seedResponse.json()).state.isDemoData, true);

    const persistedResponse = await fetch(`${baseUrl}/api/state`);
    assert.equal((await persistedResponse.json()).isDemoData, true);

    process.env.VERCEL = '1';
    const missingDatabaseResponse = await fetch(`${baseUrl}/api/state`);
    assert.equal(missingDatabaseResponse.status, 500);
    assert.match((await missingDatabaseResponse.json()).error, /POSTGRES_URL or DATABASE_URL/);
  } finally {
    if (server?.listening) {
      await new Promise<void>((resolve, reject) => {
        server?.close((error) => error ? reject(error) : resolve());
      });
    }
    if (previousEnvironment.databaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousEnvironment.databaseUrl;
    if (previousEnvironment.postgresUrl === undefined) delete process.env.POSTGRES_URL;
    else process.env.POSTGRES_URL = previousEnvironment.postgresUrl;
    if (previousEnvironment.vercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousEnvironment.vercel;
    if (previousEnvironment.dataDirectory === undefined) delete process.env.SKILLTRACE_DATA_DIR;
    else process.env.SKILLTRACE_DATA_DIR = previousEnvironment.dataDirectory;
    await rm(dataDirectory, {recursive: true, force: true});
  }
});
