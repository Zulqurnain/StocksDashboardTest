import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import prisma from '../db';
import bcrypt from 'bcryptjs';

describe('Investments API', () => {
  let cookie: string[];
  let userId: string;
  let investmentId: string;

  beforeAll(async () => {
    await prisma.transaction.deleteMany({});
    await prisma.investment.deleteMany({});
    await prisma.user.deleteMany({ where: { email: 'invest-test@example.com' } });

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'invest-test@example.com',
        password: hashedPassword,
        name: 'Investment Test User',
      },
    });
    userId = user.id;

    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'invest-test@example.com',
      password: 'password123',
    });
    cookie = loginRes.headers['set-cookie'] as unknown as string[];
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany({});
    await prisma.investment.deleteMany({});
    await prisma.user.deleteMany({ where: { email: 'invest-test@example.com' } });
    await prisma.$disconnect();
  });

  describe('POST /api/investments', () => {
    it('should create a new investment', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Cookie', cookie)
        .send({
          type: 'STOCK',
          symbol: 'TEST',
          name: 'Test Stock',
          quantity: 10,
          purchasePrice: 100,
          currentPrice: 110,
        });

      expect(res.status).toBe(201);
      expect(res.body.investment).toHaveProperty('id');
      expect(res.body.investment.symbol).toBe('TEST');
      investmentId = res.body.investment.id;
    });

    it('should reject invalid investment data', async () => {
      const res = await request(app)
        .post('/api/investments')
        .set('Cookie', cookie)
        .send({
          type: 'INVALID',
          symbol: 'TEST',
          name: 'Test Stock',
          quantity: -10,
          purchasePrice: 100,
          currentPrice: 110,
        });

      expect(res.status).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).post('/api/investments').send({
        type: 'STOCK',
        symbol: 'TEST',
        name: 'Test Stock',
        quantity: 10,
        purchasePrice: 100,
        currentPrice: 110,
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/investments', () => {
    it('should return all investments for user', async () => {
      const res = await request(app)
        .get('/api/investments')
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.investments).toBeInstanceOf(Array);
      expect(res.body.investments.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/investments/:id', () => {
    it('should return a specific investment', async () => {
      const res = await request(app)
        .get(`/api/investments/${investmentId}`)
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.investment.id).toBe(investmentId);
    });

    it('should return 404 for non-existent investment', async () => {
      const res = await request(app)
        .get('/api/investments/00000000-0000-0000-0000-000000000000')
        .set('Cookie', cookie);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/investments/:id', () => {
    it('should update an investment', async () => {
      const res = await request(app)
        .put(`/api/investments/${investmentId}`)
        .set('Cookie', cookie)
        .send({
          currentPrice: 120,
        });

      expect(res.status).toBe(200);
      expect(res.body.investment.currentPrice).toBe(120);
    });
  });

  describe('DELETE /api/investments/:id', () => {
    it('should delete an investment', async () => {
      const res = await request(app)
        .delete(`/api/investments/${investmentId}`)
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Investment deleted successfully');
    });

    it('should return 404 for already deleted investment', async () => {
      const res = await request(app)
        .delete(`/api/investments/${investmentId}`)
        .set('Cookie', cookie);

      expect(res.status).toBe(404);
    });
  });
});
