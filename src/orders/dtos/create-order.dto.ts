import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';

import { CoreOutput } from 'src/common/dtos/output.dto';
import { DishOption } from 'src/restaurants/entities/dish.entity';
import { Order } from '../entities/order.entity';

// OrderItem 전체를 받지 않기 위해 사용
@InputType()
class CreateORderItemInput {
  @Field((type) => Int)
  dishId: number;

  @Field((type) => DishOption, { nullable: true })
  options?: DishOption[];
}

@InputType()
export class CreateOrderInput {
  @Field((type) => Int)
  restaurantId: number;

  @Field((type) => [CreateORderItemInput])
  items: CreateORderItemInput[];
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
