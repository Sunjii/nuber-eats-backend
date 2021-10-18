import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ILike, Like, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateDishInput, CreateDishOutput } from './dtos/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dtos/create-restaurant.dtos';
import { DeleteDishInput, DeleteDishOutput } from './dtos/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dtos/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dtos/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurants.entitiy';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // Repository import
    private readonly restaurants: Repository<Restaurant>,
    private readonly cateogires: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.cateogires.getOrCreate(
        createRestaurantInput.categoryName,
      );

      newRestaurant.category = category;
      await this.restaurants.save(newRestaurant);
      return {
        ok: true,
      };
    } catch {
      return { ok: false, error: 'Could not create restaurnat' };
    }
  }

  async findRestaurantById({
    restaurnatId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurnat = await this.restaurants.findOne(restaurnatId, {
        relations: ['menu'],
      });
      if (!restaurnat) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      return {
        ok: true,
        restaurant: restaurnat,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not find restaurant',
      };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      // find restaurant
      const restaurant = await this.restaurants.findOne(
        editRestaurantInput.restaurantID,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // check the owner
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't edit a restaurant that you don't own",
        };
      }
      ////////////////////////////////////////////////////////////
      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.cateogires.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }
      await this.restaurants.save([
        {
          id: editRestaurantInput.restaurantID,
          ...editRestaurantInput,
          ...(category && { category }), // if category exisit will return object eaquals cateogry
        },
      ]);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not edit restaurant',
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    { restaurantID }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      // find restaurant
      const restaurant = await this.restaurants.findOne(restaurantID);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }
      // check the owner
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't delete a restaurant that you don't own",
        };
      }
      // delete
      await this.restaurants.delete(restaurantID);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete.',
      };
    }
  }

  //
  // Category Service
  //

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.cateogires.find();
      return {
        ok: true,
        categories,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load categories',
      };
    }
  }

  countRestaurant(category: Category) {
    return this.restaurants.count({ category });
  }
  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.cateogires.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: 'Category not found',
        };
      }

      // pagination with 25
      const restaurants = await this.restaurants.find({
        where: {
          category,
        },
        take: 25,
        skip: (page - 1) * 25,
      });
      //category.restaurants = restaurants;
      const totalResults = await this.countRestaurant(category);

      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load category',
      };
    }
  }

  // return all restaurnats with pagination
  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      // restaurants and count
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 25,
        take: 25,
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load restaurants',
      };
    }
  }
  // return search result
  async searchRestaurnatByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurnats, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: ILike(`%${query}%`),
        }, // typeORM - ILike : find all upper and lower case
        // todo : make pagination's repository?
        skip: (page - 1) * 25,
        take: 25,
      });
      return {
        ok: true,
        searchingResults: restaurnats,
        totalResults,
        totalPages: Math.ceil(totalResults / 25),
      };
    } catch {
      return {
        ok: false,
        error: 'Could not search for restaurant',
      };
    }
  }

  //
  // Dish Service
  //

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      // find restuarant
      const restaurant = await this.restaurants.findOne(
        createDishInput.restaurantId,
      );
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      // check owner
      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: "You can't add dish not your restaurant",
        };
      }

      // create & add dish
      await this.dishes.save(
        this.dishes.create({ ...createDishInput, restaurant }),
      );
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create dish',
      };
    }
  }

  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      // find dish
      const dish = await this.dishes.findOne(editDishInput.dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      // owner checking
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't do that",
        };
      }
      await this.dishes.save([
        {
          id: editDishInput.dishId,
          ...editDishInput,
        },
      ]);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not edit dish',
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      // find dish
      const dish = await this.dishes.findOne(dishId, {
        relations: ['restaurant'],
      });
      if (!dish) {
        return {
          ok: false,
          error: 'Dish not found',
        };
      }
      // owner checking
      if (dish.restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: "You can't do that",
        };
      }
      await this.dishes.delete(dishId);
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not delete dish',
      };
    }
  }
}
