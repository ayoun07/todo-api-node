const request = require("supertest");
const express = require("express");
const { router } = require("../routes/todo");
const { getDb, saveDb, mockDb } = require("../database/database");

jest.mock("../database/database");

const app = express();
app.use(express.json());
app.use("/", router);

describe("Todos API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // POST /todos
  describe("POST /todos", () => {
    it("should create a new todo", async () => {
      const mockTodo = {
        id: 1,
        title: "Test Todo",
        description: null,
        status: "pending",
      };
      mockDb.exec.mockReturnValueOnce([
        {
          columns: ["id", "title", "description", "status"],
          values: [
            [
              mockTodo.id,
              mockTodo.title,
              mockTodo.description,
              mockTodo.status,
            ],
          ],
        },
      ]);

      const response = await request(app)
        .post("/")
        .send({ title: "Test Todo" })
        .expect(201);

      expect(response.body).toEqual(mockTodo);
      expect(mockDb.run).toHaveBeenCalled();
      expect(saveDb).toHaveBeenCalled();
    });

    it("should return 422 if title is missing", async () => {
      await request(app)
        .post("/")
        .send({ description: "No title" })
        .expect(422);
    });
  });

  // GET /todos
  describe("GET /todos", () => {
    it("should return a list of todos", async () => {
      const mockTodos = [
        { id: 1, title: "Todo 1", description: null, status: "pending" },
        { id: 2, title: "Todo 2", description: null, status: "pending" },
      ];
      mockDb.exec.mockReturnValueOnce([
        {
          columns: ["id", "title", "description", "status"],
          values: mockTodos.map((todo) => [
            todo.id,
            todo.title,
            todo.description,
            todo.status,
          ]),
        },
      ]);

      const response = await request(app).get("/").expect(200);

      expect(response.body).toEqual(mockTodos);
    });
  });

  // GET /todos/:id
  describe("GET /todos/:id", () => {
    it("should return a single todo", async () => {
      const mockTodo = {
        id: 1,
        title: "Test Todo",
        description: null,
        status: "pending",
      };
      mockDb.exec.mockReturnValueOnce([
        {
          columns: ["id", "title", "description", "status"],
          values: [
            [
              mockTodo.id,
              mockTodo.title,
              mockTodo.description,
              mockTodo.status,
            ],
          ],
        },
      ]);

      const response = await request(app).get("/1").expect(200);

      expect(response.body).toEqual(mockTodo);
    });

    it("should return 404 if todo not found", async () => {
      mockDb.exec.mockReturnValueOnce([]);

      await request(app).get("/999").expect(404);
    });
  });

  // PUT /todos/:id
  describe("PUT /todos/:id", () => {
    it("should update a todo", async () => {
      const mockTodo = {
        id: 1,
        title: "Updated Todo",
        description: null,
        status: "pending",
      };
      mockDb.exec
        .mockReturnValueOnce([
          {
            columns: ["id", "title", "description", "status"],
            values: [[mockTodo.id, "Old Todo", null, "pending"]],
          },
        ])
        .mockReturnValueOnce([
          {
            columns: ["id", "title", "description", "status"],
            values: [
              [
                mockTodo.id,
                mockTodo.title,
                mockTodo.description,
                mockTodo.status,
              ],
            ],
          },
        ]);

      const response = await request(app)
        .put("/1")
        .send({ title: "Updated Todo" })
        .expect(200);

      expect(response.body).toEqual(mockTodo);
      expect(mockDb.run).toHaveBeenCalled();
      expect(saveDb).toHaveBeenCalled();
    });

    it("should return 404 if todo not found", async () => {
      mockDb.exec.mockReturnValueOnce([]);

      await request(app)
        .put("/999")
        .send({ title: "Updated Todo" })
        .expect(404);
    });
  });

  // DELETE /todos/:id
  describe("DELETE /todos/:id", () => {
    it("should delete a todo", async () => {
      mockDb.exec.mockReturnValueOnce([{ columns: ["id"], values: [[1]] }]);

      await request(app).delete("/1").expect(200);

      expect(mockDb.run).toHaveBeenCalled();
      expect(saveDb).toHaveBeenCalled();
    });

    it("should return 404 if todo not found", async () => {
      mockDb.exec.mockReturnValueOnce([]);

      await request(app).delete("/999").expect(404);
    });
  });

  // GET /todos/search/all
  describe("GET /todos/search/all", () => {
    it("should return todos matching search query", async () => {
      const mockTodos = [
        { id: 1, title: "Test Todo", description: null, status: "pending" },
      ];
      mockDb.exec.mockReturnValueOnce([
        {
          columns: ["id", "title", "description", "status"],
          values: mockTodos.map((todo) => [
            todo.id,
            todo.title,
            todo.description,
            todo.status,
          ]),
        },
      ]);

      const response = await request(app).get("/search/all?q=Test").expect(200);

      expect(response.body).toEqual(mockTodos);
    });
  });
});
