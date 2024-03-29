import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_ORDER_UPDATE,
  NEW_PENDING_ORDER,
  PUB_SUB,
} from 'src/common/common.constants';
import { Dish } from 'src/restaurants/entities/dish.entity';
import { Restaurant } from 'src/restaurants/entities/restaurants.entitiy';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { TakeOrderInput, TakeOrderOutput } from './dtos/take-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, OrderStatus } from './entities/order.entity';

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
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
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
      // trigger for pubsub
      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });
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
          orders = orders.filter((order) => order.status === status);
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

  // can i see that order?
  canSeeOrder(user: User, order: Order): boolean {
    // check user role
    let allowed = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      allowed = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      allowed = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      allowed = false;
    }
    return allowed;
  }

  // get an Order
  async getOrder(
    user: User,
    { id: orderId }: GetOrderInput,
  ): Promise<GetOrderOutput> {
    try {
      // find order
      const order = await this.orders.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: 'You cant see that',
        };
      }

      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not load order',
      };
    }
  }

  // edit order
  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      // get order
      const order = await this.orders.findOne(orderId);
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }

      // check the role
      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: "You can't see that",
        };
      }

      let canEdit = true;

      // customer can't change order status
      if (user.role === UserRole.Client) {
        canEdit = false;
      }
      // Owner와 Delivery 역시 이 상태의 주문은 수정할 수 없다.
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (
          status !== OrderStatus.PickedUp &&
          status !== OrderStatus.Delivered
        ) {
          canEdit = false;
        }
      }
      //
      if (!canEdit) {
        return {
          ok: false,
          error: "You can't edit order",
        };
      }
      // done
      await this.orders.save({
        id: orderId,
        status,
      });

      // trigger for pubsub
      const newOrder = { ...order, status };
      if (user.role === UserRole.Owner) {
        if (status === OrderStatus.Cooked) {
          await this.pubSub.publish(NEW_COOKED_ORDER, {
            cookedOrders: newOrder,
          });
        }
      }
      await this.pubSub.publish(NEW_ORDER_UPDATE, { orderUpdates: newOrder });

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: "Can't edit order",
      };
    }
  }

  async takeOrder(
    driver: User,
    { id: orderId }: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    try {
      // find Order
      const order = await this.orders.findOne(orderId);
      if (!order) {
        return {
          ok: false,
          error: 'Order not found',
        };
      }
      if (order.driver) {
        return {
          ok: false,
          error: 'This order already has a driver',
        };
      }
      await this.orders.save({
        id: orderId,
        driver,
      });
      // publish
      await this.pubSub.publish(NEW_ORDER_UPDATE, {
        orderUpdates: { ...order, driver },
      });
      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: 'Could not update order',
      };
    }
  }
}
