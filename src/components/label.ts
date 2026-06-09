import type { APIComponentInLabel } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent, render } from '../internal';
import type { ChannelSelectComponent } from './channel-select';
import type { CheckboxComponent } from './checkbox';
import type { CheckboxGroupComponent } from './checkbox-group';
import type { SingleWithFragments } from './fragment';
import type { InputComponent } from './input';
import type { MentionableSelectComponent } from './mentionable-select';
import type { RadioGroupComponent } from './radio-group';
import type { RoleSelectComponent } from './role-select';
import type { SelectComponent } from './select';
import type { UserSelectComponent } from './user-select';

export type LabelChildComponentBase =
  | SelectComponent
  | UserSelectComponent
  | RoleSelectComponent
  | MentionableSelectComponent
  | ChannelSelectComponent
  | InputComponent
  | RadioGroupComponent
  | CheckboxGroupComponent
  | CheckboxComponent;

export type LabelChildComponent = SingleWithFragments<LabelChildComponentBase>;

export interface LabelComponent
  extends ComponentBase<
    'Label',
    {
      label: string;
      description: string | undefined;
      component: APIComponentInLabel;
    }
  > {
  description: (description: string | undefined) => this;
}

export function label(labelText: string, component: LabelChildComponent): LabelComponent {
  let descriptionVar: string | undefined;

  const output = {
    ...constructComponent('Label', ({ stack, context }) => ({
      label: labelText,
      description: descriptionVar,
      component: render([component], [...stack, 'Label'], context)[0] as APIComponentInLabel,
    })),

    description: (description: string | undefined) => {
      descriptionVar = description;

      return output;
    },
  };

  return output;
}
