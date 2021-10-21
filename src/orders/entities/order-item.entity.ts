import { CoreEntity } from 'src/common/entities/core.entity';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Dish, DishOption } from 'src/restaurants/entities/dish.entity';

@InputType('OrderItemInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
  @Field((type) => Dish)
  @ManyToOne((type) => Dish, { nullable: true, onDelete: 'CASCADE' })
  dish: Dish;

  // option을 위해 json을 사용함. - 옵션 수정/변경의 용이성
  // relation의 과다 수정을 피하기 위해서임
  @Field((type) => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];
}
