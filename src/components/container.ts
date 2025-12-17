import type { APIMessageComponent } from 'discord-api-types/v10';
import type { DisUIComponent } from '../core/constants';
import { type ComponentBase, constructComponent, render } from '../internal';

interface ContainerComponent
  extends ComponentBase<
    'Container',
    {
      components: APIMessageComponent[];
      accent_color: number | string | undefined;
      spoiler: boolean | undefined;
    }
  > {
  color: (color: number | string | undefined) => this;
  spoiler: (condition?: boolean) => this;
  disabled: (condition?: boolean) => this;
  id: (id: string) => this;
}

export function container(
  ...components: Array<DisUIComponent<
    'Text' | 'Divider' | 'Row' | 'MediaGallery' | 'Section' | 'Button' | 'Thumbnail' | 'Select' | 'Fragment'
  > | null>
): ContainerComponent {
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
