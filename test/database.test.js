const { getDb, saveDb } = require('../database/database');

describe('Database Module', () => {
  it('devrait initialiser la base de données correctement', async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='todos'");
    expect(result.length).toBeGreaterThan(0);
  });

  it('devrait sauvegarder la base de données', () => {
    expect(() => saveDb()).not.toThrow();
  });
});