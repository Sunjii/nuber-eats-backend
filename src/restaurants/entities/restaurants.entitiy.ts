import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  @Field((type) => String)
  name: string;

  @Field((tpye) => Boolean)
  isVegan: boolean;

  @Field((type) => String)
  adress: string;

  @Field((type) => String)
  ownersName: string;
}
