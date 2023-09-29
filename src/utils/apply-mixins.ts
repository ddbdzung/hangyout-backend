/**
 * @see https://www.typescriptlang.org/docs/handbook/mixins.html
 * @link https://blog.logrocket.com/typescript-mixins-examples-and-use-cases/
 */
export function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null),
      );
    });
  });
}
