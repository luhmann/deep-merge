/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  snapshotFormat: {
    escapeString: false,
    printBasicPrototype: false,
  },
};
