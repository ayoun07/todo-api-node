const request = require('supertest');
const express = require('express');
const app = require('../app');
const jestOpenAPI = require('jest-openapi').default;
const swaggerJsdoc = require('swagger-jsdoc');

describe('Fichier app.js', () => {
  it('devrait répondre sur la route de base ou swagger', async () => {
    const response = await request(app).get('/api-docs/');
    expect(response.status).toBe(200);
  });
});


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Todo API', version: '1.0.0' },
  },
  apis: ['./routes/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

jestOpenAPI(swaggerSpec);

describe('API Contract Validation', () => {
  it('doit respecter le contrat Swagger pour GET /todos', async () => {
    const res = await request(app).get('/todos?skip=0&limit=10');
    
    expect(res.status).toBe(200);
    
    expect(res).toSatisfyApiSpec();
  });
});

describe('Routes de base de app.js', () => {
  it('devrait répondre OK sur /health', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('devrait répondre sur la route racine /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('Welcome');
  });
});