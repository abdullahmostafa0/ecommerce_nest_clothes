
import { config } from "dotenv"
import { resolve, join } from "path"
config({ path: resolve("config/.env") });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from "express";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors()
  app.use("/paymob/webhook", express.raw({ type: 'application/json' }))
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/api/uploads' })
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
