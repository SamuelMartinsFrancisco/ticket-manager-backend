import { Global, Module } from "@nestjs/common";
import { dbClientProvider } from "./database.provider";

@Global()
@Module({
  providers: [dbClientProvider],
  exports: [dbClientProvider],
})
export class DatabaseModule {}