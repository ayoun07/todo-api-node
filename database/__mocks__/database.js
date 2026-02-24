const mockDb = {
  run: jest.fn(),
  exec: jest.fn(),
  export: jest.fn(),
};

const getDb = jest.fn().mockResolvedValue(mockDb);
const saveDb = jest.fn();

module.exports = { getDb, saveDb, mockDb };
