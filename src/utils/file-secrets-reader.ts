import * as fs from 'node:fs';

export function getSecret(path: string): string | undefined {
  if (!path) {
    console.warn('🟠 getSecret called with empty key');
    return undefined;
  }

  try {
    if (fs.existsSync(path)) {
      const fileName = path.split('/').at(-1) ?? '';
      const obfuscatedFileName = fileName?.substring(0, 2) + '*'.repeat(fileName.length - 3)
      console.log(`🔵 Secret file found. Reading ${obfuscatedFileName}.txt content...`);
      return fs.readFileSync(path, 'utf8').trim();
    }

    console.warn(`🟠 Secret file not found: ${path}`);
  } catch (err) {
    console.error(`🔴 Error reading secret file ${path}:`, err);
    return undefined;
  }
  return undefined;
}
