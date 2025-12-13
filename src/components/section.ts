import type { DisUIComponent } from '../core/constants';
import { constructComponent, render } from '../internal';
import { text as textComponent } from './text';

export function section(
  text: DisUIComponent<'Text'>[] | DisUIComponent<'Text'>,
  accessory: DisUIComponent<'Thumbnail' | 'Button'> | null,
) {
  if (!accessory) {
    return textComponent(...(Array.isArray(text) ? text : [text]));
  }

  const output = {
    ...constructComponent('Section', ({ stack, context }) => ({
      components: render(Array.isArray(text) ? text : [text], [...stack, 'Section'], context),
      accessory: render([accessory], [...stack, 'Section'], context)[0],
    })),
  };

  return output;
}
