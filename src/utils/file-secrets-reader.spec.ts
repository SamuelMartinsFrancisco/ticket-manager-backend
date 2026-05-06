import * as fs from 'node:fs';
import { getSecret } from './file-secrets-reader';

jest.mock('node:fs');

const existsSyncMock = jest.mocked(fs.existsSync);
const readFileSyncMock = jest.mocked(fs.readFileSync);

describe('getSecret', () => {
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    existsSyncMock.mockClear();
    readFileSyncMock.mockClear();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should read and trim secret from an existing file', () => {
    const path = '/secrets/jwt_secret.txt';
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue('my-super-secret\n  ');

    const result = getSecret(path);

    expect(result).toBe('my-super-secret');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return undefined and warn for an empty string path', () => {
    const result = getSecret('');

    expect(result).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith('🟠 getSecret called with empty key');
    expect(existsSyncMock).not.toHaveBeenCalled();
    expect(readFileSyncMock).not.toHaveBeenCalled();
  });

  it('should return undefined and warn for a null path', () => {
    const result = getSecret(null as unknown as string);

    expect(result).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith('🟠 getSecret called with empty key');
    expect(existsSyncMock).not.toHaveBeenCalled();
    expect(readFileSyncMock).not.toHaveBeenCalled();
  });

  it('should return undefined and warn when the file does not exist', () => {
    const path = '/secrets/missing.txt';
    existsSyncMock.mockReturnValue(false);

    const result = getSecret(path);

    expect(result).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(`🟠 Secret file not found: ${path}`);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return undefined and log error when readFileSync throws', () => {
    const path = '/secrets/protected.txt';
    const error = new Error('EACCES: permission denied');
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockImplementation(() => {
      throw error;
    });

    const result = getSecret(path);

    expect(result).toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `🔴 Error reading secret file ${path}:`,
      error
    );
    expect(consoleWarnSpy).not.toHaveBeenCalledWith(
      `🟠 Secret file not found: ${path}`
    );
  });

  it('should return empty string when file contains only whitespace', () => {
    const path = '/secrets/blank.txt';
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue('   \n\t  ');

    const result = getSecret(path);

    expect(result).toBe('');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return empty string when file is empty', () => {
    const path = '/secrets/empty.txt';
    existsSyncMock.mockReturnValue(true);
    readFileSyncMock.mockReturnValue('');

    const result = getSecret(path);

    expect(result).toBe('');
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});