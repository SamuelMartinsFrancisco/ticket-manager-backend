import { Request } from "express";

export interface TokenPayload {
  sub: string,
  username: string,
  email: string,
  role: string,
}

export type RequestWithUser = Request & { user: TokenPayload }