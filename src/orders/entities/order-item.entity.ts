import { CoreEntity } from 'src/common/entities/core.entity';
import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Dish, DishChoice } from 'src/restaurants/entities/dish.entity';

// Order Item의 옵션이 어떠한지
@ObjectType()
@InputType('OrderItemOptionInputType', { isAbstract: true })
export class OrderItemOption {
  @Field((type) => String)
  name: string;
  @Field((type) => [DishChoice], { nullable: true })
  choices?: DishChoice[];
  @Field((type) => Int, { nullable: true })
  extra?: number;
}

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field((type) => Dish)
  @ManyToOne((type) => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  // option을 위해 json을 사용함. - 옵션 수정/변경의 용이성
  // relation의 과다 수정을 피하기 위해서임
  @Field((type) => [OrderItemOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: OrderItemOption[];
}
