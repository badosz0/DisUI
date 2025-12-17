import type { APIMessageComponent } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent, render } from '../internal';
import type { ButtonComponent } from './button';
import type { FragmentComponent } from './fragment';
import type { SelectComponent } from './select';

type InRowComponent = ButtonComponent | SelectComponent | FragmentComponent;

export interface RowComponent extends ComponentBase<'Row', { components: APIMessageComponent[] }> {
  add: (component: InRowComponent) => this;
  disabled: (condition?: boolean) => this;
}

export function row(...components: (InRowComponent | null)[]): RowComponent {
  const componentsVar: (InRowComponent | null)[] = components;
  let disabledVar: boolean | undefined;

  const output = {
    ...constructComponent('Row', ({ stack, context }) => ({
      components: render(componentsVar.filter(Boolean), [...stack, 'Row'], {
        ...context,
        disabled: disabledVar,
      }),
    })),

    add: (component: InRowComponent) => {
      componentsVar.push(component);

      return output;
    },

    disabled: (condition = true) => {
      disabledVar = condition;
      return output;
    },
  };

  return output;
}
