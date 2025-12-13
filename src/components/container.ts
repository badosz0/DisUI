import type { DisUIComponent } from '../core/constants';
import { constructComponent, render } from '../internal';

export function container(
  ...components: Array<DisUIComponent<
    'Text' | 'Divider' | 'Row' | 'MediaGallery' | 'Section' | 'Button' | 'Thumbnail' | 'Select' | 'Fragment'
  > | null>
) {
  let accentColorVar: number | string | undefined;
  let spoilerVar: boolean | undefined;
  let disabledVar: boolean | undefined;
  let idVar: string | undefined;

  const output = {
    ...constructComponent('Container', ({ stack, context }) => ({
      components: render(components, [...stack, 'Container'], {
        ...context,
        disabled: disabledVar,
        id: idVar,
      }),
      accent_color: accentColorVar,
      spoiler: spoilerVar,
    })),

    color: (color: number | string | undefined) => {
      accentColorVar = typeof color === 'string' ? Number.parseInt(color.slice(1), 16) : color;
      return output;
    },

    spoiler: (condition = true) => {
      spoilerVar = condition;
      return output;
    },

    disabled: (condition = true) => {
      disabledVar = condition;
      return output;
    },

    id: (id: string) => {
      idVar = id;
      return output;
    },
  };

  return output;
}
