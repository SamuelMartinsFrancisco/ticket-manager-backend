export interface CredentialsDTO {
  userId: string,
  password: string,
  createdAt: string,
  updatedAt?: string | null,
};

export type CreateCredentialDTO = Pick<CredentialsDTO, 'userId' | 'password'>