import * as fc from "fast-check";
import { test, expect, describe } from "@jest/globals";
import { bannedKeys, merge } from "./deep-merge";
import { lodashMerge } from "./test-utils";

export type Ship = {
  name: string;
  cannons: number;
  crew: number;
  harbor: string;
};

export type Pirate = {
  firstName: string;
  lastName: string;
  birthday: Date;
  occupation: "Pirate" | "Captain";
  ship?: Ship;
  skills?: string[];
  bounty?: number;
};

const getJackSparrow: () => Pirate = () => ({
  firstName: "Jack",
  lastName: "Sparrow",
  occupation: "Pirate",
  birthday: new Date("2022-08-31T19:00:00Z"),
  skills: ["Racketeering", "Heists"],
  ship: {
    name: "Black Pearl",
    cannons: 10,
    crew: 1,
    harbor: "Sansibar",
  },
});

const getIsCaptain = () => ({
  occupation: "Captain",
});

const getSpringCook = () => ({
  birthday: new Date("2022-04-01T00:00:00Z"),
  skills: ["Cooking"],
});

const getHasShip = () => ({
  ship: {
    name: "Flying Dutchman",
    cannons: 222,
    crew: 1111,
  },
});

describe("Preconditions", () => {
  test("when called with no arguments, then it should throw", () => {
    function noArguments() {
      merge();
    }

    expect(noArguments).toThrowErrorMatchingInlineSnapshot(
      `"\`merge\` called without any arguments."`
    );
  });

  test("when called with non-objects, then it should throw", () => {
    function invalidArguments() {
      merge(1 as any, "foo", undefined);
    }

    expect(invalidArguments).toThrowErrorMatchingInlineSnapshot(
      `"Only object literals are allowed as params. No class instances, no arrays, no scalars."`
    );
  });

  test("when called with class instances, then it should throw", () => {
    class Foo {}
    const sut = new Foo();

    function classArgument() {
      merge(sut as any);
    }

    expect(classArgument).toThrowErrorMatchingInlineSnapshot(
      `"Only object literals are allowed as params. No class instances, no arrays, no scalars."`
    );
  });

  test("when called with an object literal with non-enumerable-properties, then it should throw", () => {
    const sut = getJackSparrow();
    Object.defineProperty(sut, "bounty", { value: 50000, enumerable: false });

    function nonEnumerable() {
      merge(sut);
    }

    expect(nonEnumerable).toThrowErrorMatchingInlineSnapshot(
      `"Merge called with an object containing a non-enumerable property. Those will be lost."`
    );
  });

  test("when called with keys that are part of the object-prototype, then it should throw", () => {
    const sut = {
      valueOf: null,
    };

    function prototypePoisoning() {
      merge(sut);
    }

    expect(prototypePoisoning).toThrowErrorMatchingInlineSnapshot(
      `"Objects must not include keys that try to override properties or method on \`Object.prototype\`"`
    );
  });
});

test("when called with an empty object as parameter, then it should have no effect", () => {
  const sut = getJackSparrow();

  const result = merge(sut, {});

  expect(result).toBe(sut);
});

test("should merge values", () => {
  const result = merge(
    getJackSparrow(),
    getIsCaptain(),
    getSpringCook(),
    getHasShip()
  );

  expect(result).toMatchInlineSnapshot(`
{
  "birthday": 2022-04-01T00:00:00.000Z,
  "firstName": "Jack",
  "lastName": "Sparrow",
  "occupation": "Captain",
  "ship": {
    "cannons": 222,
    "crew": 1111,
    "harbor": "Sansibar",
    "name": "Flying Dutchman",
  },
  "skills": [
    "Cooking",
  ],
}
`);
});

test("should not merge arrays", () => {
  const result = merge(getJackSparrow(), getSpringCook());

  expect(result.skills).toEqual(["Cooking"]);
});

test("should ignore `undefined` as an override", () => {
  const result = merge(getJackSparrow(), {
    lastName: undefined,
    ship: { name: undefined },
  });

  expect(result).toEqual(getJackSparrow());
});

test("should preserve `undefined` if it is the only value for a key", () => {
  const a = {
    firstName: "John",
    lastName: undefined,
    ship: { name: undefined, cannons: 200 },
  };
  const b = {
    firstName: "Jack",
    lastName: "Sparrow",
    occupation: undefined,
    ship: { cannons: undefined, crew: undefined },
  };
  const c = { birthday: undefined };
  const result = merge(a, b, c);

  expect(result).toMatchInlineSnapshot(`
{
  "birthday": undefined,
  "firstName": "Jack",
  "lastName": "Sparrow",
  "occupation": undefined,
  "ship": {
    "cannons": 200,
    "crew": undefined,
    "name": undefined,
  },
}
`);
});

test("should match the result of lodash.merge", () =>
  fc.assert(
    fc.property(
      fc.array(
        fc.object({
          key: fc
            .string({ minLength: 1 })
            // * any messing with the object-prototype fails the preconditions
            .filter((key) => !bannedKeys.includes(key)),
          withNullPrototype: true,
          withMap: true,
          withSet: true,
          values: [
            fc.boolean(),
            fc.string(),
            fc.fullUnicodeString(),
            fc.double(),
            fc.integer(),
            fc.constant(null),
            fc.constant(undefined),
            fc.date(),
          ],
        }),
        {
          minLength: 2,
        }
      ),
      (args) => {
        const result = merge(...args);
        // * Compare result to lodash-merge because that is the library we want to replace
        const expected = lodashMerge(...(args as []));

        expect(result).toEqual(expected);
      }
    )
  ));

test("nested objects should not be referentially equal", () => {
  const pirate = getJackSparrow();
  const ship = getHasShip();
  const result = merge(pirate, ship);

  expect(result.ship).not.toBe(pirate.ship);
  expect(result.ship).not.toBe(ship.ship);
});
