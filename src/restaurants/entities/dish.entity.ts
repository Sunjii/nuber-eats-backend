import { InputType, ObjectType, Field, Int } from '@nestjs/graphql';
import { IsNumber, IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Entity, Column, ManyToOne, RelationId } from 'typeorm';
import { Restaurant } from './restaurants.entitiy';

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
class DishOption {
  // 옵션의 이름과, 선택사항, 가격
  @Field((type) => String)
  name: string;
  @Field((type) => [String], { nullable: true })
  choices?: string[];
  @Field((type) => Int)
  extra: number;
}

@InputType('DishInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Dish extends CoreEntity {
  @Field((type) => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field((type) => Int)
  @Column()
  @IsNumber()
  price: number;

  @Field((type) => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  photo: string;

  @Field((type) => String)
  @Column()
  @IsString()
  @Length(10, 140)
  description: string;

  @Field((type) => [DishOption], { nullable: true })
  @Column({ type: 'json', nullable: true })
  options?: DishOption[];

  // Many to One Relation
  @Field((type) => Restaurant)
  @ManyToOne((type) => Restaurant, (restaurant) => restaurant.menu, {
    onDelete: 'CASCADE',
  })
  restaurant: Restaurant;

  @RelationId((dish: Dish) => dish.restaurant)
  restaurantId: number;
}
