import 'dotenv/config';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /products trả về danh sách', async () => {
    const res = await request(app.getHttpServer()).get('/products').expect(200);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it('đăng nhập sai mật khẩu bị từ chối', () =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'khach@tennis.local', password: 'sai-mat-khau' })
      .expect(401));

  it('khách không vào được /admin, admin vào được', async () => {
    const http = app.getHttpServer();
    const customer = await request(http)
      .post('/auth/login')
      .send({ email: 'khach@tennis.local', password: 'Customer@123' })
      .expect(201);
    await request(http)
      .get('/admin/stats')
      .set('Authorization', `Bearer ${customer.body.accessToken}`)
      .expect(403);

    const admin = await request(http)
      .post('/auth/login')
      .send({ email: 'admin@tennis.local', password: 'Admin@123' })
      .expect(201);
    await request(http)
      .get('/admin/stats')
      .set('Authorization', `Bearer ${admin.body.accessToken}`)
      .expect(200);
  });

  it('giỏ hàng yêu cầu đăng nhập', () =>
    request(app.getHttpServer()).get('/cart').expect(401));
});
