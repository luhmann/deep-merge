# deep-merge

A limited and opinionated deep-merge algorithm for data-only object-literals. Nested objects are copied and merged. Arrays, Maps, Sets as values are replaced by the last value.

## Usage

```ts
import { merge } from "./deep-merge";

const jackSparrow = {
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
};

const isCaptain = {
  occupation: "Captain",
};

const springCook = {
  birthday: new Date("2022-04-01T00:00:00Z"),
  skills: ["Cooking"],
};

const hisShip = {
  ship: {
    name: "Flying Dutchman",
    crew: 1111,
  },
};

merge(jackSparrow, isCaptain, springCook, hisShip);

// {
//   "birthday": new Date(2022-04-01T00:00:00.000Z),
//   "firstName": "Jack",
//   "lastName": "Sparrow",
//   "occupation": "Captain",
//   "ship": {
//     "cannons": 222,
//     "crew": 10,
//     "harbor": "Sansibar",
//     "name": "Flying Dutchman",
//   },
//   "skills": [
//     "Cooking",
//   ],
// }
```

## Motivation

Most library merge functions handle a lot of edge cases that occur if you want to merge anything more complex than a "bag of values". As that is what I mostly need merge-functions for I wanted a leaner and easier to understand version.
