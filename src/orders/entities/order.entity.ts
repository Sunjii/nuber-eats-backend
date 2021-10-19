import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum OrderStatus {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field((type) => User)
  @Field((type) => User)
  @ManyToOne((type) => User, (user) => user.orders, {
    onDelete: 'CASCADE',
  })
  owner: User;
  custormer: User;

  @Field((type) => User, { nullable: true })
  driver: User;

  @Field((type) => Restaurant)
  restaurant: Restaurant;

  @Field((type) => [Dish])
  dishes: Dish[];

  @Field((type) => Float)
  @Column()
  total: number;

  @Field((type) => OrderStatus)
  @Column({ type: 'enum', enum: OrderStatus })
  status: OrderStatus;
}
