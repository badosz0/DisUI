import type { APISelectMenuOption } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent } from '../internal';

export interface SelectComponent
  extends ComponentBase<
    'Select',
    {
      placeholder: string | undefined;
      disabled: boolean | undefined;
      min_values: number | undefined;
      max_values: number | undefined;
      options: APISelectMenuOption[];
    }
  > {
  placeholder: (placeholder: string) => this;
  disabled: (condition?: boolean) => this;
  min: (minValues: number) => this;
  max: (maxValues: number) => this;
  addOptions: (options: APISelectMenuOption[]) => this;
  setOptions: (options: APISelectMenuOption[]) => this;
  sortOptions: (sort: (a: APISelectMenuOption, b: APISelectMenuOption) => number) => this;
  addOption: (
    name: string,
    value: string,
    current: boolean,
    options: Omit<APISelectMenuOption, 'label' | 'value' | 'default'>,
  ) => this;
}

export function select(id: string): SelectComponent {
  let placeholderVar: string | undefined;
  let disabledVar: boolean | undefined;
  let minValuesVar: number | undefined;
  let maxValuesVar: number | undefined;
  let optionsVar: APISelectMenuOption[] = [];

  const output = {
    ...constructComponent('Select', ({ context }) => {
      const options = optionsVar.length > 0 ? optionsVar : [{ label: 'No options', value: 'no-options' }];
      const disabled = optionsVar.length === 0 || (disabledVar ?? !!context.disabled);

      return {
        placeholder: placeholderVar,
        disabled,
        min_values: minValuesVar,
        max_values: maxValuesVar ? Math.max(1, Math.min(maxValuesVar, optionsVar.length)) : undefined,
        options,
        custom_id: `${context.id ? `${context.id}-` : id}`,
      };
    }),

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

    addOptions: (options: APISelectMenuOption[]) => {
      optionsVar.push(...options);

      return output;
    },

    setOptions: (options: APISelectMenuOption[]) => {
      optionsVar = options;

      return output;
    },

    sortOptions: (
      sort: (a: APISelectMenuOption, b: APISelectMenuOption) => number = (a, b) => a.label.localeCompare(b.label),
    ) => {
      optionsVar.sort(sort);

      return output;
    },

    addOption: (
      name: string,
      value: string,
      current: boolean,
      options: Omit<APISelectMenuOption, 'label' | 'value' | 'default'> = {},
    ) => {
      optionsVar.push({
        label: name,
        value,
        default: current,
        ...options,
      });

      return output;
    },
  };

  return output;
}
