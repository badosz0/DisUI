import type { APIMessageComponent } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent, render } from '../internal';
import type { ButtonComponent } from './button';
import type { SingleWithFragments, WithFragments } from './fragment';
import type { ImageComponent } from './image';
import { type TextComponent, text as textComponent } from './text';

export interface SectionComponent
  extends ComponentBase<'Section', { components: APIMessageComponent[]; accessory: APIMessageComponent | null }> {}

type SectionTextComponent = WithFragments<TextComponent>;
type SectionAccessoryComponent = SingleWithFragments<ImageComponent | ButtonComponent>;

export function section(
  text: SectionTextComponent | (SectionTextComponent | null)[] | null,
  accessory: SectionAccessoryComponent | null,
): SectionComponent | TextComponent {
  if (!accessory) {
    const content = render(Array.isArray(text) ? text : [text]).flatMap((component) =>
      'content' in component && typeof component.content === 'string' ? [component.content] : [],
    );

    return textComponent(...content);
  }

  const output = {
    ...constructComponent('Section', ({ stack, context }) => ({
      components: render(Array.isArray(text) ? text : [text], [...stack, 'Section'], context),
      accessory: render([accessory], [...stack, 'Section'], context)[0] ?? null,
    })),
  };

  return output;
}
