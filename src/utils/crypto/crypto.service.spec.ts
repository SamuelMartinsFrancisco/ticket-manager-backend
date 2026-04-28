import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { errorMsg } from '@/constants';

const ENCRYPTION_SECRET = 'test-encryption-secret';
const BLIND_INDEX_SECRET = 'test-blind-index-secret';

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'ENCRYPTION_SECRET') return ENCRYPTION_SECRET;
    if (key === 'BLIND_INDEX_SECRET') return BLIND_INDEX_SECRET;
    return undefined;
  }),
};

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  afterAll(() => {
    jest.clearAllMocks();
  })

  describe('encrypt', () => {
    it('should encrypt a string and return a hex string', () => {
      const plaintext = 'my secret data';

      const encrypted = service.encrypt(plaintext);

      expect(typeof encrypted).toBe('string');
      expect(encrypted.length).toBeGreaterThan(32); // IV (32 hex) + ciphertext
      expect(encrypted).toMatch(/^[a-f0-9]+$/i);
    });

    it('should throw InternalServerErrorException when encryption secret is missing', () => {
      const noKeyService = new CryptoService({
        get: jest.fn((key: string) => {
          if (key === 'BLIND_INDEX_SECRET') return BLIND_INDEX_SECRET;
          return undefined; // ENCRYPTION_SECRET missing
        }),
      } as any);

      expect(() => noKeyService.encrypt('data')).toThrow(InternalServerErrorException);
      expect(() => noKeyService.encrypt('data')).toThrow(errorMsg.MISSING_CRYPTO_SECRET);
    });
  });

  describe('decrypt', () => {
    it('should decrypt a previously encrypted string correctly', () => {
      const plaintext = 'original message';
      const encrypted = service.encrypt(plaintext);

      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw InternalServerErrorException when encryption secret is missing', () => {
      const noKeyService = new CryptoService({ get: () => undefined } as any);
      expect(() => noKeyService.decrypt('any')).toThrow(InternalServerErrorException);
      expect(() => noKeyService.decrypt('any')).toThrow(errorMsg.MISSING_CRYPTO_SECRET);
    });

    it('should throw InternalServerErrorException with DECRYPTION_FAILURE on invalid encrypted data', () => {
      const invalidData = 'not-valid-hex-data';

      expect(() => service.decrypt(invalidData)).toThrow(InternalServerErrorException);
      expect(() => service.decrypt(invalidData)).toThrow(errorMsg.DECRYPTION_FAILURE);
    });

    it('should throw DECRYPTION_FAILURE if IV length is insufficient', () => {
      const shortData = 'ab'; // length 2, less than 32

      expect(() => service.decrypt(shortData)).toThrow(InternalServerErrorException);
      expect(() => service.decrypt(shortData)).toThrow(errorMsg.DECRYPTION_FAILURE);
    });
  });

  describe('encryptMany', () => {
    it('should encrypt all string fields of a record', () => {
      const data = { field1: 'alpha', field2: 'beta' };

      const encrypted = service.encryptMany(data);

      expect(encrypted).toHaveProperty('field1');
      expect(encrypted).toHaveProperty('field2');
      expect(encrypted.field1).not.toBe(data.field1);
      expect(encrypted.field2).not.toBe(data.field2);
      // verify each is valid encrypted hex
      expect(encrypted.field1).toMatch(/^[a-f0-9]+$/i);
      expect(encrypted.field2).toMatch(/^[a-f0-9]+$/i);
    });

    it('should propagate error if encryption fails (missing key)', () => {
      const noKeyService = new CryptoService({ get: () => undefined } as any);

      expect(() => noKeyService.encryptMany({ any: 'value' })).toThrow(InternalServerErrorException);
      expect(() => noKeyService.encryptMany({ any: 'value' })).toThrow(errorMsg.MISSING_CRYPTO_SECRET);
    });
  });

  describe('decryptMany', () => {
    it('should decrypt all fields of a previously encrypted record', () => {
      const original = { first: 'hello', second: 'world' };
      const encrypted = service.encryptMany(original);

      const decrypted = service.decryptMany(encrypted);

      expect(decrypted).toEqual(original);
    });

    it('should throw InternalServerErrorException when key is missing', () => {
      const noKeyService = new CryptoService({ get: () => undefined } as any);

      expect(() => noKeyService.decryptMany({ any: 'data' })).toThrow(InternalServerErrorException);
      expect(() => noKeyService.decryptMany({ any: 'data' })).toThrow(errorMsg.MISSING_CRYPTO_SECRET);
    });

    it('should throw DECRYPTION_FAILURE for invalid encrypted data in any field', () => {
      const badData = { field: 'short' };

      expect(() => service.decryptMany(badData)).toThrow(InternalServerErrorException);
      expect(() => service.decryptMany(badData)).toThrow(errorMsg.DECRYPTION_FAILURE);
    });
  });

  describe('generateBlindIndex', () => {
    it('should generate a deterministic hex hash', () => {
      const input = 'user@example.com';
      const index1 = service.generateBlindIndex(input);
      const index2 = service.generateBlindIndex(input);

      expect(index1).toBe(index2);
      expect(index1).toMatch(/^[a-f0-9]+$/i);
      expect(index1.length).toBe(64); // sha256 hex digest
    });

    it('should normalize input by trimming and lowercasing', () => {
      const input1 = '  User@Example.COM  ';
      const input2 = 'user@example.com';

      const index1 = service.generateBlindIndex(input1);
      const index2 = service.generateBlindIndex(input2);

      expect(index1).toBe(index2);
    });

    it('should produce different indexes for different inputs', () => {
      const index1 = service.generateBlindIndex('alpha');
      const index2 = service.generateBlindIndex('beta');

      expect(index1).not.toBe(index2);
    });
  });
});