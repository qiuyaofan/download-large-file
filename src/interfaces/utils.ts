export type ValueOf<T> = T[keyof T];
export type ArrElementType<ArrType> = ArrType extends readonly (infer ElementType)[]
  ? ElementType
  : never;
