import * as crypto from 'node:crypto';
import { InternalServerErrorException } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { errorMsg } from '@/constants';
import { RecordCryptoFields } from './crypto.types';

const IV_LENGTH = 16; // initialization vector length
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const HASMAC_ALGORITHMM = 'sha256';

@Injectable()
export class CryptoService {
  private readonly key: string;
  private readonly hashmacPepper: string;

  constructor(private readonly configService: ConfigService) {
    this.hashmacPepper = this.configService.get<string>('BLIND_INDEX_SECRET')!;
    const cryptoSecret = this.configService.get<string>('ENCRYPTION_SECRET');

    if (cryptoSecret) {
      this.key = crypto
        .createHash('sha512')
        .update(cryptoSecret)
        .digest('hex')
        .substring(0, 32);
    } else {
      this.key = '';
    }
  }

  encrypt(data: string) {
    if (!this.key) throw new InternalServerErrorException(errorMsg.MISSING_CRYPTO_SECRET);

    const iv = crypto.randomBytes(IV_LENGTH); // initialization vector

    try {
      const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(this.key), iv);

      let encrypted = cipher.update(data, 'utf-8', 'hex');
      encrypted += cipher.final('hex');

      return iv.toString('hex') + encrypted;
    } catch (error: any) {
      console.error({ "error": error.message ?? error });
      throw new InternalServerErrorException(errorMsg.ENCRYPTION_FAILURE);
    }
  }

  decrypt(data: string) {
    if (!this.key) throw new InternalServerErrorException(errorMsg.MISSING_CRYPTO_SECRET);

    try {
      const inputIV = data.slice(0, 32); // convertion to hex doubled length
      const encrypted = data.slice(32);

      const decipher = crypto.createDecipheriv(
        ENCRYPTION_ALGORITHM,
        Buffer.from(this.key),
        Buffer.from(inputIV, 'hex')
      );

      let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
      decrypted += decipher.final('utf-8');

      return decrypted;
    } catch (error: any) {
      console.error({ "error": error.message ?? error });
      throw new InternalServerErrorException(errorMsg.DECRYPTION_FAILURE);
    }
  }

  encryptMany<T extends string>(data: RecordCryptoFields<T>) {
    const encryptedData = {};

    Object.entries(data).forEach(([field, value]) => {
      encryptedData[field] = this.encrypt(value as string);
    });

    return encryptedData as RecordCryptoFields<T>;
  }

  decryptMany<T extends string>(data: RecordCryptoFields<T>) {
    const decryptedData = {};

    Object.entries(data).forEach(([field, value]) => {
      decryptedData[field] = this.decrypt(value as string);
    });

    return decryptedData as RecordCryptoFields<T>;
  }

  generateBlindIndex(data: string) {
    const normalizedData = data?.trim()?.toLowerCase();

    return crypto
      .createHmac(HASMAC_ALGORITHMM, this.hashmacPepper)
      .update(normalizedData)
      .digest('hex');
  }
}