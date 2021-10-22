import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entitiy';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishes: Repository<Dish>,
  ) {}

  //
  // Order Service
  //
  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      // find restaurant
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found',
        };
      }

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      // make itmes
      for (const item of items) {
        // find dish
        const dish = await this.dishes.findOne(item.dishId);
        if (!dish) {
          // abort all
          return {
            ok: false,
            error: 'Dish not found',
          };
        }
        let dishFinalPrice = dish.price;
        // console.log(`Dish price: ${dish.price}`);

        // get property from dish
        for (const itemOption of item.options) {
          const dishOption = dish.options.find(
            (dishOption) => dishOption.name === itemOption.name,
          );
          if (dishOption) {
            if (dishOption.extra) {
              //console.log(`$USD + ${dishOption.extra}`);
              dishFinalPrice += dishOption.extra;
            } else {
              // choice에 따른 extra를 찾는다
              const dishOptionChoice = dishOption.choices.find(
                (optionChoice) => optionChoice.name === itemOption.choice,
              );
              if (dishOptionChoice) {
                if (dishOptionChoice.extra) {
                  //console.log(`$USD + ${dishOptionChoice.extra}`);
                  dishFinalPrice += dishOptionChoice.extra;
                }
              }
            }
          }
        }
        orderFinalPrice = orderFinalPrice + dishFinalPrice;

        // orderitems에 각 주문을 추가
        const orderItem = await this.orderItems.save(
          this.orderItems.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      // create order!!!
      const order = await this.orders.save(
        this.orders.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          itmes: orderItems,
        }),
      );
      // done
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not create order',
      };
    }
  }

  // getOrders
  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];

      // role check
      if (user.role === UserRole.Client) {
        // find order
        orders = await this.orders.find({
          where: {
            customer: user,
            status,
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orders.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        // owner의 경우 여러개의 restaruant를 가질 수 있음.
        // find all restaurants
        const restaurants = await this.restaurants.find({
          where: {
            owner: user,
            ...(status && { status }),
          },
          relations: ['orders'],
        });
        // get order from restaurants
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);
        if (status) {
          orders = orders.map((order) => order.status === status);
        }
      }
      // return orders
      //console.log(orders);
      return {
        ok: true,
        orders,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not get orders',
      };
    }
  }
}
