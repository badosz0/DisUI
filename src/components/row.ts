import type { APIMessageComponent } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent, render } from '../internal';
import type { ButtonComponent } from './button';
import type { ChannelSelectComponent } from './channel-select';
import type { FragmentComponent } from './fragment';
import type { MentionableSelectComponent } from './mentionable-select';
import type { RoleSelectComponent } from './role-select';
import type { SelectComponent } from './select';
import type { UserSelectComponent } from './user-select';

type InRowComponent =
  | ButtonComponent
  | SelectComponent
  | UserSelectComponent
  | RoleSelectComponent
  | MentionableSelectComponent
  | ChannelSelectComponent
  | FragmentComponent;

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
