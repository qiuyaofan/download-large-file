// key[]+value[]=>{key:value}
export const arrToObject = <K, T>(keys: K[], values: T[]) => {
  return keys.reduce((result, _key, index: number) => {
    result[_key] = values[index];
    return result;
  }, {} as any);
};

export const getValueLabelOptions = (names: string[], values: string[], labels: string[]) => {
  const value = arrToObject(names, values);
  const label = arrToObject(values, labels);
  const name = arrToObject(values, names);
  const options = values.map((name) => ({
    label: label[name],
    value: name,
  }));
  return {
    value,
    label,
    options,
    name,
  };
};
