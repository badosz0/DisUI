import type { APIMessageComponent } from 'discord-api-types/v10';
import type { DisUIComponent } from '../core/constants';
import { type ComponentBase, constructComponent, render } from '../internal';

interface RowComponent extends ComponentBase<'Row', { components: APIMessageComponent[] }> {
  add: (component: DisUIComponent<'Button' | 'Select'>) => this;
  disabled: (condition?: boolean) => this;
}

export function row(...components: DisUIComponent<'Button' | 'Select' | 'Fragment'>[]) {
  const componentsVar: DisUIComponent[] = components;
  let disabledVar: boolean | undefined;

  const output = {
    ...constructComponent('Row', ({ stack, context }) => ({
      components: render(componentsVar.filter(Boolean), [...stack, 'Row'], {
        ...context,
        disabled: disabledVar,
      }),
    })),

    add: (component: DisUIComponent<'Button' | 'Select'>) => {
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
