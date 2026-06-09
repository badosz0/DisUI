import type { APICheckboxGroupOption } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent } from '../internal';

export interface CheckboxGroupComponent
  extends ComponentBase<
    'CheckboxGroup',
    {
      custom_id: string;
      options: APICheckboxGroupOption[];
      min_values: number | undefined;
      max_values: number | undefined;
      required: boolean | undefined;
    }
  > {
  required: (condition?: boolean) => this;
  min: (minValues: number) => this;
  max: (maxValues: number) => this;
  addOptions: (options: APICheckboxGroupOption[]) => this;
  setOptions: (options: APICheckboxGroupOption[]) => this;
  sortOptions: (sort: (a: APICheckboxGroupOption, b: APICheckboxGroupOption) => number) => this;
  addOption: (
    name: string,
    value: string,
    current?: boolean,
    options?: Omit<APICheckboxGroupOption, 'label' | 'value' | 'default'>,
  ) => this;
  default: (...values: string[]) => this;
}

export function checkboxGroup(id: string): CheckboxGroupComponent {
  let requiredVar: boolean | undefined;
  let minValuesVar: number | undefined;
  let maxValuesVar: number | undefined;
  let optionsVar: APICheckboxGroupOption[] = [];

  const output = {
    ...constructComponent('CheckboxGroup', ({ context }) => ({
      custom_id: `${context.id ? `${context.id}-` : ''}${id}`,
      options: optionsVar,
      min_values: minValuesVar,
      max_values: maxValuesVar,
      required: requiredVar,
    })),

    required: (condition = true) => {
      requiredVar = condition;

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

    addOptions: (options: APICheckboxGroupOption[]) => {
      optionsVar.push(...options);

      return output;
    },

    setOptions: (options: APICheckboxGroupOption[]) => {
      optionsVar = options;

      return output;
    },

    sortOptions: (
      sort: (a: APICheckboxGroupOption, b: APICheckboxGroupOption) => number = (a, b) => a.label.localeCompare(b.label),
    ) => {
      optionsVar.sort(sort);

      return output;
    },

    addOption: (
      name: string,
      value: string,
      current = false,
      options: Omit<APICheckboxGroupOption, 'label' | 'value' | 'default'> = {},
    ) => {
      optionsVar.push({
        label: name,
        value,
        default: current,
        ...options,
      });

      return output;
    },

    default: (...values: string[]) => {
      optionsVar = optionsVar.map((option) => ({ ...option, default: values.includes(option.value) }));

      return output;
    },
  };

  return output;
}
