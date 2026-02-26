const request = require('supertest');
const express = require('express');
const app = require('../app'); // Assure-toi que app.js exporte bien l'objet app

describe('Fichier app.js', () => {
  it('devrait répondre sur la route de base ou swagger', async () => {
    // Si tu as Swagger sur /api-docs, on teste ça
    const response = await request(app).get('/api-docs/');
    expect(response.status).toBe(200);
  });
});