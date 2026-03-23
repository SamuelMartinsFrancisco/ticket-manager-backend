import { Inject } from "@nestjs/common";
import { db } from ".";

export const DB_CLIENT = 'DB_CLIENT';

export const InjectDbClient = () => Inject(DB_CLIENT);

export const dbClientProvider = {
  provide: DB_CLIENT,
  useValue: db,
};