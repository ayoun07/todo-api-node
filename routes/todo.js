const { Router } = require('express');
const { getDb, saveDb } = require('../database/database');

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [pending, completed]
 */

/**
 * @openapi
 * /todos:
 *   get:
 *     summary: Récupère la liste des tâches (avec pagination)
 *     parameters:
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments à sauter
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments à récupérer
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
router.get('/', async (req, res) => {
  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const db = await getDb();
  const rows = db.exec('SELECT * FROM todos LIMIT ? OFFSET ?', [limit, skip]);
  res.json(toArray(rows));
});

/**
 * @openapi
 * /todos/{id}:
 *   get:
 *     summary: Récupère une tâche par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la tâche
 *       404:
 *         description: Tâche non trouvée
 */
router.get('/:id', async (req, res) => {
  const db = await getDb();
  const rows = db.exec('SELECT * FROM todos WHERE id = ?', [req.params.id]);
  if (!rows.length || !rows[0].values.length)
    return res.status(404).json({ detail: 'Todo not found' });
  res.json(toObj(rows));
});

/**
 * @openapi
 * /todos:
 *   post:
 *     summary: Crée une nouvelle tâche
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tâche créée
 */
router.post('/', async (req, res) => {
  try {
    const { title, description = null, status = 'pending' } = req.body;
    if (!title) return res.status(422).json({ detail: 'title is required' });
    const db = await getDb();
    db.run('INSERT INTO todos (title, description, status) VALUES (?, ?, ?)', [
      title,
      description,
      status,
    ]);
    const results = db.exec(
      'SELECT * FROM todos WHERE id = last_insert_rowid()',
    );
    saveDb();
    res.status(201).json(toObj(results));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @openapi
 * /todos/{id}:
 *   put:
 *     summary: Met à jour une tâche existante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       200:
 *         description: Tâche mise à jour
 */
router.put('/:id', async (req, res) => {
  const db = await getDb();
  const existing = db.exec('SELECT * FROM todos WHERE id = ?', [req.params.id]);
  if (!existing.length || !existing[0].values.length)
    return res.status(404).json({ detail: 'Todo not found' });

  const old = toObj(existing);
  const title = req.body.title ?? old.title;
  const description = req.body.description ?? old.description;
  const status = req.body.status ?? old.status;

  db.run(
    'UPDATE todos SET title = ?, description = ?, status = ? WHERE id = ?',
    [title, description, status, req.params.id],
  );
  const rows = db.exec('SELECT * FROM todos WHERE id = ?', [req.params.id]);
  saveDb();
  res.json(toObj(rows));
});

/**
 * @openapi
 * /todos/{id}:
 *   delete:
 *     summary: Supprime une tâche
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message de confirmation
 */
router.delete('/:id', async (req, res) => {
  const db = await getDb();
  const existing = db.exec('SELECT * FROM todos WHERE id = ?', [req.params.id]);
  if (!existing.length || !existing[0].values.length)
    return res.status(404).json({ detail: 'Todo not found' });
  db.run('DELETE FROM todos WHERE id = ?', [req.params.id]);
  saveDb();
  res.json({ detail: 'Todo deleted' });
});

/**
 * @openapi
 * /todos/search/all:
 *   get:
 *     summary: Recherche textuelle dans les titres
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Le texte à chercher
 *     responses:
 *       200:
 *         description: Résultats de la recherche
 */
router.get('/search/all', async (req, res) => {
  try {
    const q = req.query.q || '';
    const db = await getDb();
    const query = 'SELECT * FROM todos WHERE title LIKE ?';
    const results = db.exec(query, [`%${q}%`]);
    res.json(toArray(results));
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// Helpers
function toObj(rows) {
  if (!rows || !rows.length || !rows[0].values.length) return null;
  const cols = rows[0].columns;
  const vals = rows[0].values[0];
  const obj = {};
  cols.forEach((c, i) => (obj[c] = vals[i]));
  return obj;
}

function toArray(rows) {
  if (!rows.length) return [];
  const cols = rows[0].columns;
  return rows[0].values.map((vals) => {
    const obj = {};
    cols.forEach((c, i) => (obj[c] = vals[i]));
    return obj;
  });
}

module.exports = router;
