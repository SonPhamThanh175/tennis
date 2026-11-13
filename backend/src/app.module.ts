import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CartModule } from './cart/cart.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { UploadsModule } from './uploads/uploads.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProductsModule } from './products/products.module.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    AdminModule,
    UploadsModule,
  ],
})
export class AppModule {}
