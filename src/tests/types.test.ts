import { describe, expect, it } from 'vitest';
import { button, container, fragment, gallery, image, row, section, text, ui } from '../components';

void row(fragment(button('Primary', 'primary'), fragment(button('Secondary', 'secondary'))));
void row(fragment(null, button('Tertiary', 'tertiary'), fragment(null, button('Quaternary', 'quaternary'))));
void container(fragment(text('Copy'), button('Action', 'action')));
void container(fragment(null, text('Copy'), fragment(null, button('Action 2', 'action-2'))));
void gallery(fragment(image('https://example.com/one.png'), fragment(image('https://example.com/two.png'))));
void gallery(fragment(null, image('https://example.com/three.png')));
void section(fragment(text('Alpha'), fragment(null, text('Beta'))), fragment(null, button('Open', 'open'), null));

// @ts-expect-error row fragments should only unwrap to row-compatible components
void row(fragment(text('Invalid')));

// @ts-expect-error container fragments should not allow top-level ui payloads
void container(fragment(ui(text('Invalid'))));

// @ts-expect-error gallery fragments should only unwrap to thumbnails
void gallery(fragment(text('Invalid')));

// @ts-expect-error section accessories can unwrap through fragments, but only to valid accessory component kinds
void section(text('Body'), fragment(null, text('Invalid accessory')));

// @ts-expect-error nulls inside fragments should not widen row-compatible children
void row(fragment(null, text('Still invalid')));

describe('types', () => {
  it('keeps fragment-aware child typings compiling', () => {
    expect(true).toBe(true);
  });
});
