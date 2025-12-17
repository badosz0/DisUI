import type { APIMessageComponent } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent, render } from '../internal';
import type { ButtonComponent } from './button';
import type { ImageComponent } from './image';
import { type TextComponent, text as textComponent } from './text';

export interface SectionComponent
  extends ComponentBase<'Section', { components: APIMessageComponent[]; accessory: APIMessageComponent | null }> {}

export function section(
  text: TextComponent | TextComponent[],
  accessory: ImageComponent | ButtonComponent | null,
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
