/** biome-ignore-all lint/suspicious/noExplicitAny: Any value can be stored in the store, complex types */

type StoreValue = 'bigint' | 'snowflake' | 'number' | 'string' | 'boolean';
type StoreValueType = {
  bigint: bigint;
  snowflake: bigint;
  number: number;
  string: string;
  boolean: boolean;
};

export class Store<T extends Record<string, StoreValue>> {
  private definition: Record<string, StoreValue>;

  constructor(definition: T) {
    this.definition = definition;
  }

  serialize(value: { [K in keyof T]: StoreValueType[T[K]] }) {
    return Object.entries(value)
      .sort(([a, b]) => Object.keys(this.definition).indexOf(a) - Object.keys(this.definition).indexOf(b))
      .map(([key, value]) => {
        const type = this.definition[key];

        return {
          bigint: () => value.toString(),
          snowflake: () => {
            const buf = Buffer.alloc(8);
            buf.writeBigUInt64BE(value);
            return buf.toString('base64url');
          },
          number: () => value.toString(),
          string: () => value,
          boolean: () => (value ? '1' : '0'),
        }[type]();
      })
      .join(';');
  }

  deserialize(buffer: string): { [K in keyof T]: StoreValueType[T[K]] } {
    return Object.fromEntries(
      buffer.split(';').map((item, i) => {
        const [key, type] = Object.entries(this.definition)[i];

        return [
          key,
          {
            bigint: () => BigInt(item),
            snowflake: () => BigInt(Buffer.from(item, 'base64url').readBigUInt64BE()),
            number: () => Number(item),
            string: () => item,
            boolean: () => item === '1',
          }[type](),
        ];
      }),
    ) as any;
  }
}

export namespace Store {
  export type infer<T extends Store<any>> = T extends Store<infer U> ? { [K in keyof U]: StoreValueType[U[K]] } : never;
}
