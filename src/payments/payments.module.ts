import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurants/entities/restaurants.entitiy';
import { Payment } from './entities/payment.entity';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Restaurant])],
  providers: [PaymentService, PaymentResolver],
})
export class PaymentsModule {}
