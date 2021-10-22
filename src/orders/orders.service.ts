import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entitiy';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
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
    //console.log(order);
  }
}
