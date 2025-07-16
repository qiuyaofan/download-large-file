export {};
declare global {
  type ValueOf<T> = T[keyof T];
  type ArrElementType<ArrType> = ArrType extends readonly (infer ElementType)[]
    ? ElementType
    : never;
  interface Window {
    pdfjsLib?: any;
  }
}
