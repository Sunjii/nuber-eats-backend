/* eslint-disable @typescript-eslint/no-unused-vars */
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { FieldsOnCorrectTypeRule } from 'graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entitiy';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('PaymentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field((type) => User, { nullable: true })
  @ManyToOne((type) => User, (user) => user.payments)
  user?: User;
  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field((type) => String)
  @Column()
  transactionId: string;

  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant)
  restaurant?: Restaurant;

  @Field((type) => Int)
  @RelationId((payment: Payment) => payment.restaurant)
  restaurnatId: number;
}
