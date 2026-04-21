// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { SeedsService } from './seeds.service';
import { handleDatabaseException } from '@/utils/exceptionHandler';
import { SeedsModule } from './seeds.module';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedsModule);
  await app.init();

  const seedsService = app.get(SeedsService);

  try {
    await seedsService.seed();
    console.log('🌱 Seeding completed with success!');
  } catch (error: any) {
    console.error('\n🍁 Seeding has failed!\n', error.message);
    handleDatabaseException(error, 'Seeding has failed')
    return;
  } finally {
    await app.close();
  }
}

bootstrap();
