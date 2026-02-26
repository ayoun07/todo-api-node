const request = require('supertest');
const express = require('express');
const app = require('../app');

describe('Fichier app.js', () => {
  it('devrait répondre sur la route de base ou swagger', async () => {
    const response = await request(app).get('/api-docs/');
    expect(response.status).toBe(200);
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