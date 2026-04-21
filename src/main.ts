import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { DatabaseService } from './infrastructure/database/database.service';
import { ValidationPipe } from '@nestjs/common';

const logSuccess = (serverPort: number | string) => {
  console.log('\n✅ O servidor foi iniciado com sucesso!\n');
  console.log(`E está disponível em: localhost:${serverPort}\n`);
}

const logFailure = (error: any) => {
  console.log('\n🔴 A inicialização do servidor falhou');
  console.log(`Detalhes: ${error?.message ?? error}\n`);
}

const swaggerConfig = new DocumentBuilder()
  .setTitle('Ticket Manager API')
  .setDescription('APIs do backend do aplicativo mobile Ticket Manager')
  .setVersion('1.0')
  .addTag('ticket-manager')
  .addBearerAuth()
  .addSecurityRequirements('bearer')
  .build();

const swaggerOptions: SwaggerDocumentOptions = {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
};

async function bootstrap() {
  const serverPort = process.env.SERVER_PORT ?? 3000;

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig, swaggerOptions);
  SwaggerModule.setup('api', app, documentFactory);

  await app.init();

  const databaseService = app.get(DatabaseService);

  await migrate(databaseService.db, {
    migrationsFolder: './drizzle'
  })

  try {
    await app.listen(serverPort);
    logSuccess(serverPort);

  } catch (error: any) {
    logFailure(error);
  }
}

bootstrap();
