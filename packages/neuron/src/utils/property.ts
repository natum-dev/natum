export const getPropertyValue = <
  T extends Record<string, unknown>,
  K extends string | number,
>(
  obj: T,
  key: K
) => {
  if (key in obj) {
    return obj[key as keyof T];
  }
  return undefined;
};
