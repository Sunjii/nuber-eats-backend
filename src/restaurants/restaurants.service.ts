import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dtos/create-restaurant.dtos';
import { Restaurant } from './entities/restaurants.entitiy';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // Repository import
    private readonly restaurants: Repository<Restaurant>,
  ) {}
  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find();
  }
  createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    const newRestaurant = this.restaurants.create(createRestaurantDto);
    //const newRestaurant = this.restaurants.create();
    return this.restaurants.save(newRestaurant);
  }
}
