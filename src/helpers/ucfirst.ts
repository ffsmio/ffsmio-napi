export function ucfirst<T extends string>(str: T): Capitalize<Lowercase<T>> {
  if (!str) {
    return "" as Capitalize<Lowercase<T>>;
  }

  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() as Capitalize<Lowercase<T>>;
} 