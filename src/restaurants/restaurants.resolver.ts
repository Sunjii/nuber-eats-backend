import { Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurants.entitiy';

@Resolver((of) => Restaurant)
export class RestaurantsResolver {
  @Query((returns) => Restaurant)
  myRestaurant() {
    return true;
  }
}
