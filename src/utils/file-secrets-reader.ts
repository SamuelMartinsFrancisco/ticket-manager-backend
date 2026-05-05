import * as fs from 'node:fs';

export function getSecret(path: string): string | undefined {
  if (!path) {
    console.warn('getSecret called with empty key');
    return undefined;
  }

  try {
    if (fs.existsSync(path)) {
      console.log('Secret file found. Reading content...');
      return fs.readFileSync(path, 'utf8').trim();
    }

    console.warn(`Secret file not found: ${path}`);
  } catch (err) {
    console.error(`Error reading secret file ${path}:`, err);
    return undefined;
  }
  return undefined;
}
