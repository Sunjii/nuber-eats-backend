import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';

describe('UsersModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  // closing test
  afterAll(async () => {
    await getConnection().dropDatabase();
    app.close();
  });

  //
  // Should e2e test
  //
  it.todo('me');

  it.todo('userProfile');

  it.todo('createAccount');

  it.todo('login');

  it.todo('editProfile');

  it.todo('verifyEmail');
});
