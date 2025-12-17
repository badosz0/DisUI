import { describe, expect, it } from 'vitest';
import { button, container, divider, row, text } from '../components';
import { ui } from '../core';
import { emoji } from '../structures';

describe('render', () => {
  // TODO
  it('', () => {
    const message = ui(
      container(
        text('Hello World').size('h3'),
        divider(),
        row(button('Click me', 'click-me'), button(emoji('👍'), 'like-button').disabled()),
      ).color('#FFF'),
    );
    expect(true).toBe(true);
  });
});
