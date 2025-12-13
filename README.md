# DisUI

A library for building UIs inside of Discord.

## Examples

```ts
import { ui, container, text, divider, row, button, emoji } from 'disui';

const message = ui(
  container(
    text('Hello World').size('h3'),
    divider(),
    row(
      button('Click me', 'click-me'),
      button(emoji('👍'), 'like-button').disabled(),
    )
  ).color('#FFF')
);
```

```ts
import { Store } from "disui"

const User = new Store({
  id: 'snowflake',
  age: 'number',
  verified: 'boolean',
});

const user = User.serialize({
  id: 214858075650260992n,
  age: 23,
  verified: true,
});
// => "AvtUSAxCAAA;23;1"

type MyUser = Store.infer<typeof User>;
// => { id: bigint; age: number; verified: boolean };

const myUser = User.deserialize(user);
// => { id: 214858075650260992n, age: 23, verified: true };
```