import { type APISelectMenuDefaultValue, SelectMenuDefaultValueType } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent } from '../internal';

export interface UserSelectComponent
  extends ComponentBase<
    'UserSelect',
    {
      placeholder: string | undefined;
      disabled: boolean | undefined;
      min_values: number | undefined;
      max_values: number | undefined;
      default_values: APISelectMenuDefaultValue<SelectMenuDefaultValueType.User>[] | undefined;
    }
  > {
  placeholder: (placeholder: string) => this;
  disabled: (condition?: boolean) => this;
  min: (minValues: number) => this;
  max: (maxValues: number) => this;
  addDefault: (id: string) => this;
  setDefaults: (ids: string[]) => this;
}

export function userSelect(id: string): UserSelectComponent {
  let placeholderVar: string | undefined;
  let disabledVar: boolean | undefined;
  let minValuesVar: number | undefined;
  let maxValuesVar: number | undefined;
  let defaultValuesVar: APISelectMenuDefaultValue<SelectMenuDefaultValueType.User>[] = [];

  const output = {
    ...constructComponent('UserSelect', ({ context }) => ({
      placeholder: placeholderVar,
      disabled: disabledVar ?? !!context.disabled,
      min_values: minValuesVar,
      max_values: maxValuesVar,
      default_values: defaultValuesVar.length > 0 ? defaultValuesVar : undefined,
      custom_id: `${context.id ? `${context.id}-` : id}`,
    })),

    placeholder: (placeholder: string) => {
      placeholderVar = placeholder;

      return output;
    },

    disabled: (condition = true) => {
      disabledVar = condition;

      return output;
    },

    min: (minValues: number) => {
      minValuesVar = minValues;

      return output;
    },

    max: (maxValues: number) => {
      maxValuesVar = maxValues;

      return output;
    },

    addDefault: (userId: string) => {
      defaultValuesVar.push({ id: userId, type: SelectMenuDefaultValueType.User });

      return output;
    },

    setDefaults: (ids: string[]) => {
      defaultValuesVar = ids.map((userId) => ({ id: userId, type: SelectMenuDefaultValueType.User }));

      return output;
    },
  };

  return output;
}
