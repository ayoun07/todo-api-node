const { toObj, toArray } = require("../helpers");

describe("toObj", () => {
  it("should convert a single row to an object", () => {
    const rows = [
      {
        columns: ["id", "title", "description", "status"],
        values: [[1, "Test Todo", null, "pending"]],
      },
    ];
    const result = toObj(rows);
    expect(result).toEqual({
      id: 1,
      title: "Test Todo",
      description: null,
      status: "pending",
    });
  });

  it("should return null for empty rows", () => {
    const rows = [];
    const result = toObj(rows);
    expect(result).toBeNull();
  });

  it("should return null for rows with no values", () => {
    const rows = [
      {
        columns: ["id", "title", "description", "status"],
        values: [],
      },
    ];
    const result = toObj(rows);
    expect(result).toBeNull();
  });
});

describe("toArray", () => {
  it("should convert multiple rows to an array of objects", () => {
    const rows = [
      {
        columns: ["id", "title", "description", "status"],
        values: [
          [1, "Todo 1", null, "pending"],
          [2, "Todo 2", null, "pending"],
        ],
      },
    ];
    const result = toArray(rows);
    expect(result).toEqual([
      { id: 1, title: "Todo 1", description: null, status: "pending" },
      { id: 2, title: "Todo 2", description: null, status: "pending" },
    ]);
  });

  it("should return an empty array for empty rows", () => {
    const rows = [];
    const result = toArray(rows);
    expect(result).toEqual([]);
  });

  it("should return an empty array for rows with no values", () => {
    const rows = [
      {
        columns: ["id", "title", "description", "status"],
        values: [],
      },
    ];
    const result = toArray(rows);
    expect(result).toEqual([]);
  });
});
