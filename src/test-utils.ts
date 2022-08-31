import _mergeWith from "lodash.mergewith";
import { isPlainObject } from "./deep-merge";

// ! This is only for property-based-testing, lodash is not a dependency for production code
export const lodashMerge = (...args: Array<unknown>) =>
  _mergeWith(...(args as []), (objValue: unknown, srcVal: unknown) => {
    if (Array.isArray(srcVal)) {
      return srcVal;
    }
    if (!(isPlainObject(objValue) && isPlainObject(srcVal))) {
      return srcVal;
    }
  });
