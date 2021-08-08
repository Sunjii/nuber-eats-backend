import { ArgsType, Field, InputType, OmitType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Restaurant } from '../entities/restaurants.entitiy';

@InputType()
export class CreateRestaurantDto extends OmitType(Restaurant, ['id']) {}
