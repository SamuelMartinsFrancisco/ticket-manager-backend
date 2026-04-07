import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { DatabaseService } from './infrastructure/database/database.service';

async function bootstrap() {
  const serverPort = process.env.SERVER_PORT ?? 3000;

  const app = await NestFactory.create(AppModule);

  await app.init();

  const databaseService = app.get(DatabaseService);

  await migrate(databaseService.db, {
    migrationsFolder: './drizzle'
  })

  try {
    await app.listen(serverPort);

    console.log('\n✅ O servidor foi iniciado com sucesso!\n');
    console.log(`E está disponível em: localhost:${serverPort}\n`);
  } catch (error: any) {
    console.log('\n🔴 A inicialização do servidor falhou');
    console.log(`Detalhes: ${error?.message ?? error}\n`)
  }
}
bootstrap();
