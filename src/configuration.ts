import * as Joi from 'joi';
import { getSecret } from "./utils/file-secrets-reader";

export default () => {
  const NOT_PROVIDED = '[not-provided]';

  const serverPort = process.env.SERVER_PORT;
  const blindIndexSecretFile = process.env.BLIND_INDEX_SECRET_FILE!;
  const encryptionSecretFile = process.env.ENCRYPTION_SECRET_FILE!
  const jwtSecretFile = process.env.JWT_SECRET_FILE!;
  const dbPasswordFile = process.env.DB_PASSWORD_FILE!;
  const adminPasswordFile = process.env.ADMIN_PASSWORD_FILE!;

  const config = {
    // Crypto
    JWT_SECRET: getSecret(jwtSecretFile) ?? process.env.JWT_SECRET,
    ENCRYPTION_SECRET: getSecret(encryptionSecretFile) ?? process.env.ENCRYPTION_SECRET,
    BLIND_INDEX_SECRET: getSecret(blindIndexSecretFile) ?? process.env.BLIND_INDEX_SECRET,
    // Database
    DB_NAME: process.env.DB_NAME ?? NOT_PROVIDED,
    DB_HOST: process.env.DB_HOST ?? NOT_PROVIDED,
    DB_USER: process.env.DB_USER ?? NOT_PROVIDED,
    DB_PORT: process.env.DB_PORT ?? NOT_PROVIDED,
    DB_PASSWORD: getSecret(dbPasswordFile) ?? process.env.DB_PASSWORD,
    // Server
    SERVER_PORT: serverPort ? Number.parseInt(serverPort, 10) : 8080,
    // Admin
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_NAME: process.env.ADMIN_NAME,
    ADMIN_LASTNAME: process.env.ADMIN_LASTNAME,
    ADMIN_PASSWORD: getSecret(adminPasswordFile) ?? process.env.ADMIN_PASSWORD
  };

  const finalConfig = {
    ...config,
    DATABASE_URL: `postgres://${config.DB_USER}:${config.DB_PASSWORD}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`,
  };

  const schema = Joi.object({
    JWT_SECRET: Joi.string().required(),
    ENCRYPTION_SECRET: Joi.string().required(),
    BLIND_INDEX_SECRET: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
  });

  const { error } = schema.validate(finalConfig, { abortEarly: false, allowUnknown: true });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return finalConfig;
};
