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
  ).color('#FFF');
)
```
