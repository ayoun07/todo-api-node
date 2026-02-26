const request = require("supertest");
const express = require("express");
const router = require("../routes/todo"); // Assure-toi que le chemin est correct
const { getDb, saveDb } = require("../database/database");
const { toObj, toArray } = require("../helpers");

jest.mock("../database/database");
jest.mock("../helpers");

describe("Todos API", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/todos", router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Mock des données de base
  const mockTodos = [
    {
      id: 1,
      title: "Test Todo 1",
      description: "Description 1",
      status: "pending",
    },
    {
      id: 2,
      title: "Test Todo 2",
      description: "Description 2",
      status: "completed",
    },
  ];

  // GET /todos (liste avec pagination)
  describe("GET /todos", () => {
    it("devrait retourner une liste de todos", async () => {
      const mockDb = {
        exec: jest.fn().mockReturnValue([
          {
            columns: ["id", "title", "description", "status"],
            values: mockTodos.map((todo) => Object.values(todo)),
          },
        ]),
      };
      getDb.mockResolvedValue(mockDb);
      toArray.mockReturnValue(mockTodos);

      const response = await request(app)
        .get("/todos")
        .query({ skip: 0, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTodos);
      expect(getDb).toHaveBeenCalled();
    });
  });

  // GET /todos/:id (récupérer un todo par ID)
  describe("GET /todos/:id", () => {
    it("devrait retourner un todo si trouvé", async () => {
      const mockDb = {
        exec: jest.fn().mockReturnValue([
          {
            columns: ["id", "title", "description", "status"],
            values: [[1, "Test Todo 1", "Description 1", "pending"]],
          },
        ]),
      };
      getDb.mockResolvedValue(mockDb);
      toObj.mockReturnValue(mockTodos[0]);

      const response = await request(app).get("/todos/1");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTodos[0]);
    });

    it("devrait retourner 404 si le todo n'existe pas", async () => {
      const mockDb = {
        exec: jest.fn().mockReturnValue([]),
      };
      getDb.mockResolvedValue(mockDb);

      const response = await request(app).get("/todos/notanumber");
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error");
      
    });
  });

  // POST /todos (créer un todo)
  describe("POST /todos", () => {
    it("devrait créer un nouveau todo", async () => {
      const newTodo = {
        title: "Nouveau Todo",
        description: "Nouvelle description",
        status: "pending",
      };
      const mockDb = {
        run: jest.fn(),
        exec: jest.fn().mockReturnValue([
          {
            columns: ["id", "title", "description", "status"],
            values: [[3, newTodo.title, newTodo.description, newTodo.status]],
          },
        ]),
      };
      getDb.mockResolvedValue(mockDb);
      toObj.mockReturnValue({ id: 3, ...newTodo });

      const response = await request(app).post("/todos").send(newTodo);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: 3, ...newTodo });
      expect(saveDb).toHaveBeenCalled();
    });

    it("devrait retourner 422 si le titre est manquant", async () => {
      const response = await request(app)
        .post("/todos")
        .send({ description: "Pas de titre" });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty("details");
    });
  });

  // PUT /todos/:id (mettre à jour un todo)
  describe("PUT /todos/:id", () => {
    it("devrait mettre à jour un todo existant", async () => {
      const updatedTodo = {
        title: "Todo mis à jour",
        description: "Description mise à jour",
        status: "completed",
      };
      const mockDb = {
        exec: jest
          .fn()
          .mockReturnValueOnce([
            {
              columns: ["id", "title", "description", "status"],
              values: [[1, "Ancien Todo", "Ancienne description", "pending"]],
            },
          ]) // Pour la vérification d'existence
          .mockReturnValueOnce([
            {
              columns: ["id", "title", "description", "status"],
              values: [
                [
                  1,
                  updatedTodo.title,
                  updatedTodo.description,
                  updatedTodo.status,
                ],
              ],
            },
          ]), // Après la mise à jour
        run: jest.fn(),
      };
      getDb.mockResolvedValue(mockDb);
      toObj
        .mockReturnValueOnce({
          id: 1,
          title: "Ancien Todo",
          description: "Ancienne description",
          status: "pending",
        })
        .mockReturnValueOnce({ id: 1, ...updatedTodo });

      const response = await request(app).put("/todos/1").send(updatedTodo);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, ...updatedTodo });
      expect(saveDb).toHaveBeenCalled();
    });

    it("devrait retourner 404 si le todo n'existe pas", async () => {
      const mockDb = {
        exec: jest.fn().mockReturnValue([]),
      };
      getDb.mockResolvedValue(mockDb);

      const response = await request(app)
        .put("/todos/999")
        .send({ title: "Nouveau titre" });

      expect(response.status).toBe(404);
      expect(response.body.detail).toBe("Todo not found");
      expect(response.body).toHaveProperty("detail");
    });
  });

  // DELETE /todos/:id (supprimer un todo)
  describe("DELETE /todos/:id", () => {
    it("devrait supprimer un todo existant", async () => {
      const mockDb = {
        exec: jest
          .fn()
          .mockReturnValueOnce([{ columns: ["id"], values: [[1]] }])
          .mockReturnValueOnce([]),
        run: jest.fn(),
      };
      getDb.mockResolvedValue(mockDb);

      const response = await request(app).delete("/todos/1");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("detail");
      expect(saveDb).toHaveBeenCalled();
    });

    it("devrait retourner 404 si le todo n'existe pas", async () => {
      const mockDb = {
        exec: jest.fn().mockReturnValue([]),
      };
      getDb.mockResolvedValue(mockDb);

      const response = await request(app).delete("/todos/999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("detail");
    });
  });

  // GET /todos/search/all (recherche textuelle)
  describe("GET /todos/search/all", () => {
    it("devrait retourner les todos correspondant à la recherche", async () => {
      const mockDb = {
        exec: jest.fn().mockReturnValue([
          {
            columns: ["id", "title", "description", "status"],
            values: [[1, "Test Todo 1", "Description 1", "pending"]],
          },
        ]),
      };
      getDb.mockResolvedValue(mockDb);
      toArray.mockReturnValue([mockTodos[0]]);

      const response = await request(app)
        .get("/todos/search/all")
        .query({ q: "Test", skip: 0, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockTodos[0]]);
    });
  });
});
