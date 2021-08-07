import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    RestaurantsModule,
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'sunji',
      password: 'asdf',
      database: 'nuber-eats',
      synchronize: true,
      logging: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
