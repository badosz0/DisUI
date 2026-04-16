# DisUI

A library for building UIs inside of Discord.

## Basic Usage

```ts
import { ui, container, text, divider, row, button, emoji, resolveDisUI } from 'disui';

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
const resolved = resolveDisUI(message)
// => { components: APIMessageComponent[], flags: 32768 }
```

## Multipart Uploads

```ts
import { file, image, resolveDisUI, section, text, ui } from 'disui';

const resolved = resolveDisUI(
  ui(
    file({
      name: 'report.txt',
      data: Buffer.from('hello world'),
      contentType: 'text/plain',
    }),
    section(text('Preview'), image({ name: 'preview.png', data: Buffer.from('...') })),
  ),
);

resolved.attachments;
// => [{ id: 0, filename: 'report.txt' }, { id: 1, filename: 'preview.png' }]

resolved.files;
// => [{ name: 'report.txt', data: Buffer, key: 'files[0]' }, ...]
```

`attachments` contains the JSON metadata Discord expects, and `files` contains the multipart uploads to send as `files[n]` form parts.

## Utils

```ts
import { Store } from 'disui';

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

```ts
import { emoji } from 'disui';

const like = emoji('👍');
// => { name: '👍', id: null }

const custom = emoji('<:hi:1105603587104591872>');
// => { id: '1105603587104591872', name: 'hi', animated: false }

const url = custom.url();
// => 'https://cdn.discordapp.com/emojis/1105603587104591872.png'
```
