import type { APIMessageComponent } from 'discord-api-types/v10';
import type { DisUIComponent } from '../core/constants';
import { type ComponentBase, constructComponent, render } from '../internal';
import { type TextComponent, text as textComponent } from './text';

interface SectionComponent
  extends ComponentBase<'Section', { components: APIMessageComponent[]; accessory: APIMessageComponent | null }> {}

export function section(
  text: DisUIComponent<'Text'>[] | DisUIComponent<'Text'>,
  accessory: DisUIComponent<'Thumbnail' | 'Button'> | null,
): SectionComponent | TextComponent {
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
