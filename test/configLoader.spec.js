import { test, expect } from '@playwright/test';
import { loadConfig } from '../src/configLoader.js';

function mockFile(text) {
  return { text: async () => text };
}

test('loads valid config from file', async () => {
  const validConfig = JSON.stringify({ scenes: [] });
  const config = await loadConfig({ file: mockFile(validConfig) });
  expect(config.scenes).toBeDefined();
});

test('throws on invalid config (not object)', async () => {
  const invalidConfig = '"not an object"';
  await expect(loadConfig({ file: mockFile(invalidConfig) })).rejects.toThrow();
});

test('throws on missing scenes array', async () => {
  const invalidConfig = JSON.stringify({});
  await expect(loadConfig({ file: mockFile(invalidConfig) })).rejects.toThrow();
});

test('throws if no source specified', async () => {
  await expect(loadConfig({})).rejects.toThrow();
}); 