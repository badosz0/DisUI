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
// => { data: { components: APIMessageComponent[], flags: 32768 }, files: [] }
```

## Files

```ts
import { ui, container, file, image, resolveDisUI } from 'disui';

const avatar = {
  name: 'avatar.png',
  data: Buffer.from('...'),
  contentType: 'image/png',
};

const manual = {
  name: 'manual.pdf',
  data: Buffer.from('...'),
  contentType: 'application/pdf',
};

const resolved = resolveDisUI(ui(
  container(
    image(avatar),
    file(manual),
  ),
));
// resolved.data contains attachment://avatar.png and attachment://manual.pdf
// resolved.files contains [avatar, manual]
```

## Website Link Previews

Generate a [Discord link preview](https://github.com/discord/discord-api-docs/pull/8606)
and insert the returned tag into your server-rendered `<head>`.

```ts
import { container, text, row, button, renderDisUIEmbed, resolveDisUIEmbed } from 'disui';

const preview = container(
  text('New release').size('h2'),
  text('Build Discord interfaces with DisUI.'),
  row(button('Read more', 'https://example.com/releases').style('link')),
).color(0x5865f2);

const embedTag = renderDisUIEmbed(preview);
// <script id="discord:component-embed" type="application/json">{"component":{...}}</script>

const resolved = resolveDisUIEmbed(preview);
// => { component: { type: 17, ... } } (for linked JSON previews)
```

For React, use `renderDisUIEmbedJSON()` for the script contents:

```tsx
import { renderDisUIEmbedJSON } from 'disui';

export function DiscordLinkPreview() {
  const json = renderDisUIEmbedJSON(preview);
  return (
    <script id="discord:component-embed" type="application/json" dangerouslySetInnerHTML={{ __html: json }} />
  );
}
```

Use one container, `.style('link')` for buttons, and HTTP(S) URLs for media.
Invalid components and payloads exceeding Discord's limits throw an error.

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
