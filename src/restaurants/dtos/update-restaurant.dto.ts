import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from './create-restaurant.dtos';

@InputType()
export class UpdateRestaurantInputType extends PartialType(
  CreateRestaurantDto,
) {}

@InputType()
export class UpdateRestaurantDto {
  @Field((type) => Number)
  id: number;

  @Field((type) => UpdateRestaurantInputType)
  data: UpdateRestaurantInputType;
}
