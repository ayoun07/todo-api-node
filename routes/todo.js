const { Router } = require('express');
const { getDb, saveDb } = require('../database/database');
const { toObj, toArray } = require('../helpers');
const { z } = require('zod');

const router = Router();  

const querySchema = z.object({
  q: z.string().default(''),
  skip: z.preprocess((val) => parseInt(val), z.number().min(0).default(0)),
  limit: z.preprocess((val) => parseInt(val), z.number().min(1).max(100).default(10))
});

const idSchema = z.object({
  id: z.preprocess((val) => parseInt(val), z.number().positive())
});

const todoSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100),
  description: z.string().nullable().optional(),
  status: z.enum(['pending', 'completed']).default('pending')
});

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
  try {
    const result = querySchema.safeParse(req.query);
    if (!result.success) return res.status(400).json(result.error);
  
    const { skip, limit } = result.data;
    const db = await getDb();
    const rows = db.exec('SELECT * FROM todos LIMIT ? OFFSET ?', [limit, skip]);
    res.json(toArray(rows));
    
  } catch (error) {
    console.error("Erreur get détaillée :", error);
    res.status(500).json({ error: 'Erreur lors de la récupération des todos' });
  }
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
// GET /todos/:id
router.get('/:id', async (req, res) => {

  try {
    const result = idSchema.safeParse(req.params);
    
    if (!result.success) {
      return res.status(400).json({ error: "ID invalide (doit être un nombre positif)" });
    }
  
    const db = await getDb();
    const rows = db.exec('SELECT * FROM todos WHERE id = ?', [result.data.id]);
  
    if (!rows.length || !rows[0].values.length) {
      return res.status(404).json({ detail: 'Todo not found' });
    }
    
    res.json(toObj(rows));
    
  } catch (error) {
    console.error("Erreur get-id détaillée :", error);
    res.status(500).json({ error: 'Erreur lors de la récupération du todo' });
  }
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
    const result = todoSchema.safeParse(req.body);
    if (!result.success) return res.status(422).json({ message: "Validation failed", details: result.error.issues });

    const { title, description, status } = result.data;
    const db = await getDb();
    db.run('INSERT INTO todos (title, description, status) VALUES (?, ?, ?)', [
      title, description || null, status
    ]);
    const results = db.exec('SELECT * FROM todos WHERE id = last_insert_rowid()');
    saveDb();
    res.status(201).json(toObj(results));
  } catch (err) {
    console.error("Erreur post détaillée :", err);
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


// PUT /todos/:id
router.put('/:id', async (req, res) => {

  try {
    const idResult = idSchema.safeParse(req.params);
    const bodyResult = todoSchema.partial().safeParse(req.body);
  
    if (!idResult.success || !bodyResult.success) {
      return res.status(400).json({ error: "Données invalides" });
    }
  
    const db = await getDb();
    const existing = db.exec('SELECT * FROM todos WHERE id = ?', [idResult.data.id]);
    if (!existing.length || !existing[0].values.length)
      return res.status(404).json({ detail: 'Todo not found' });
  
    const old = toObj(existing);
    const { title = old.title, description = old.description, status = old.status } = bodyResult.data;
  
    db.run('UPDATE todos SET title = ?, description = ?, status = ? WHERE id = ?', 
      [title, description, status, idResult.data.id]);
    
    const rows = db.exec('SELECT * FROM todos WHERE id = ?', [idResult.data.id]);
    saveDb();
    res.json(toObj(rows));
    
  } catch (error) {
    console.error("Erreur update détaillée :", error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du todo' });
  }
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

// delete /todos/:id
router.delete('/:id', async (req, res) => {
  try {
    const idResult = idSchema.safeParse(req.params);
    if (!idResult.success) return res.status(400).json({ error: "Invalid ID" });

    const db = await getDb();
    
    const existing = db.exec('SELECT * FROM todos WHERE id = ?', [idResult.data.id]);
    
    if (!existing?.length || !existing[0]?.values?.length) {
      return res.status(404).json({ detail: 'Todo not found' });
    }

    db.run('DELETE FROM todos WHERE id = ?', [idResult.data.id]);
    saveDb();
    
    res.json({ detail: 'Todo deleted' });
  } catch (err) {
    console.error("Erreur delete détaillée :", err);
    res.status(500).json({ error: err.message });
  }
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
    const result = querySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: "Paramètres de recherche invalides", details: result.error.format() });
    }

    const q = result.data.q;
    const db = await getDb();
    const query = 'SELECT * FROM todos WHERE title LIKE ?';
    
    const results = db.exec(query, [`%${q}%`]);
    res.json(toArray(results));
  } catch (error) {
    console.error("Erreur search détaillée :", error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

module.exports = router;
