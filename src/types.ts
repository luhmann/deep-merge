export type DataObject = Record<string, unknown>;

export type ExpandDeep<T> = T extends Record<string | number | symbol, unknown>
  ? { [K in keyof T]: ExpandDeep<T[K]> }
  : T extends Array<infer E>
  ? Array<ExpandDeep<E>>
  : T;
