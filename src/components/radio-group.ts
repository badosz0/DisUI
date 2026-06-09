import type { APIRadioGroupOption } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent } from '../internal';

export interface RadioGroupComponent
  extends ComponentBase<
    'RadioGroup',
    {
      custom_id: string;
      options: APIRadioGroupOption[];
      required: boolean | undefined;
    }
  > {
  required: (condition?: boolean) => this;
  addOptions: (options: APIRadioGroupOption[]) => this;
  setOptions: (options: APIRadioGroupOption[]) => this;
  sortOptions: (sort: (a: APIRadioGroupOption, b: APIRadioGroupOption) => number) => this;
  addOption: (
    name: string,
    value: string,
    current?: boolean,
    options?: Omit<APIRadioGroupOption, 'label' | 'value' | 'default'>,
  ) => this;
  default: (value: string | null) => this;
}

export function radioGroup(id: string): RadioGroupComponent {
  let requiredVar: boolean | undefined;
  let optionsVar: APIRadioGroupOption[] = [];

  const output = {
    ...constructComponent('RadioGroup', ({ context }) => ({
      custom_id: `${context.id ? `${context.id}-` : ''}${id}`,
      options: optionsVar,
      required: requiredVar,
    })),

    required: (condition = true) => {
      requiredVar = condition;

      return output;
    },

    addOptions: (options: APIRadioGroupOption[]) => {
      optionsVar.push(...options);

      return output;
    },

    setOptions: (options: APIRadioGroupOption[]) => {
      optionsVar = options;

      return output;
    },

    sortOptions: (
      sort: (a: APIRadioGroupOption, b: APIRadioGroupOption) => number = (a, b) => a.label.localeCompare(b.label),
    ) => {
      optionsVar.sort(sort);

      return output;
    },

    addOption: (
      name: string,
      value: string,
      current = false,
      options: Omit<APIRadioGroupOption, 'label' | 'value' | 'default'> = {},
    ) => {
      if (current) {
        optionsVar = optionsVar.map((option) => ({ ...option, default: false }));
      }

      optionsVar.push({
        label: name,
        value,
        default: current,
        ...options,
      });

      return output;
    },

    default: (value: string | null) => {
      optionsVar = optionsVar.map((option) => ({ ...option, default: value !== null && option.value === value }));

      return output;
    },
  };

  return output;
}
