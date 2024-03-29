# Project Nuber Eats

The Backend of Nuber Eats Clone.\
Nest.JS 환경에서 Typescript와 GraphQL을 사용하여 구현하였습니다.

# Features

## User Model

    - email verification
    - password (hash)
    - role [client, owner, dilivery]
    - payment list

## User Function

    - Create account
    - Find by ID
    - Update profile
    - Login
    - Email verification

## Restaurant Model

    - name
    - category
    - address
    - coverImage
    - menu
    - promotion

## Restaurnat Function

    - See Categories
    - See Restaurant by Category (pagination)
    - See Restaurant (pagination)
    - Search Restaurants

    - Edit Restaurant
    - Delete Restaurant

    - Create Dish
    - Edit Dish
    - Delete Dish

## Order Model

    - menu
    - options for menu
    - total price
    - order status

## Orders Function

    - Orders CRUD
    - Orders Subscription
      - Pending Orders for Owner
      - Order Status for Customer
      - Pending Pickup Order for Delivery

## Payment Function ~ Paddle

    - Cron Jobs
      - task scheduling

# Tech Stack

    - NestJS
    - Typescript
    - TypeORM
    - GraphQL
    - PostgresSQL
    - Mailgun (use for email verification)
