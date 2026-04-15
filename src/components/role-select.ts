import { type APISelectMenuDefaultValue, SelectMenuDefaultValueType } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent } from '../internal';

export interface RoleSelectComponent
  extends ComponentBase<
    'RoleSelect',
    {
      placeholder: string | undefined;
      disabled: boolean | undefined;
      min_values: number | undefined;
      max_values: number | undefined;
      default_values: APISelectMenuDefaultValue<SelectMenuDefaultValueType.Role>[] | undefined;
    }
  > {
  placeholder: (placeholder: string) => this;
  disabled: (condition?: boolean) => this;
  min: (minValues: number) => this;
  max: (maxValues: number) => this;
  default: (...ids: string[]) => this;
}

export function roleSelect(id: string): RoleSelectComponent {
  let placeholderVar: string | undefined;
  let disabledVar: boolean | undefined;
  let minValuesVar: number | undefined;
  let maxValuesVar: number | undefined;
  let defaultValuesVar: APISelectMenuDefaultValue<SelectMenuDefaultValueType.Role>[] = [];

  const output = {
    ...constructComponent('RoleSelect', ({ context }) => ({
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

    default: (...ids: string[]) => {
      defaultValuesVar = ids.map((roleId) => ({ id: roleId, type: SelectMenuDefaultValueType.Role }));

      return output;
    },
  };

  return output;
}
