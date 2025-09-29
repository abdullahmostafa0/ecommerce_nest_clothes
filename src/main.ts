
import { config } from "dotenv"
import { resolve } from "path"
config({ path: resolve("config/.env") });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from "express";
async function bootstrap() {
  
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.use("/user/order/webhook", express.raw({type: 'application/json'}))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
