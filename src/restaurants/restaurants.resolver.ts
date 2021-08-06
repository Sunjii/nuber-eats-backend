import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class RestaurantsResolver {
  @Query(() => Boolean) // () => 처럼 함수가 와야 함
  isPizzaGood() {
    return true;
  }
}
