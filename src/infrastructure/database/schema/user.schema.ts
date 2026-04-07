import { pgTable, text, uuid, pgEnum } from "drizzle-orm/pg-core";
import { UserRole } from "@/modules/users/user.dto";
import { timestamps } from "../shared-columns";

export const pgUserRoleEnum = pgEnum(
  'role',
  Object.values(UserRole) as [UserRole, ...UserRole[]]
);

export const usersTable = pgTable('users', {
  id: uuid().primaryKey().notNull(),
  name: text().notNull(),
  lastName: text('last_name').notNull(),
  email: text().unique().notNull(),
  emailIndex: text('email_index').unique().notNull(),
  role: pgUserRoleEnum('role').notNull(),
  ...timestamps,
});
