/*  */

import { Module } from '@nestjs/common';
import { AuthModule } from './Auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './User/user.module';
import { DashboardModule } from './Dachboard/dashboard.module';
import { SellerModule } from './Seller/seller.module';
import { SupportModule } from './Support/support.module';
import { ShippingModule } from './Shipping/shipping.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { AppController } from './app.controller';
console.log(process.env.DB_URL)
@Module({
  controllers :[AppController],
  imports: [
    AuthModule, 
    MongooseModule.forRoot(process.env.DB_URL as string),
    CacheModule.registerAsync({
      useFactory: async () => {
        return {
          store: createKeyv('redis://localhost:6379')
        }
      },
      isGlobal : true
    }),
    UserModule,
    DashboardModule,
    SellerModule,
    SupportModule,
    ShippingModule,

    
  ],
  providers: [],
})
export class AppModule {}
