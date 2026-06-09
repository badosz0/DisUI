import { type ComponentBase, constructComponent } from '../internal';

export interface CheckboxComponent
  extends ComponentBase<
    'Checkbox',
    {
      custom_id: string;
      default: boolean | undefined;
    }
  > {
  default: (condition?: boolean) => this;
}

export function checkbox(id: string): CheckboxComponent {
  let defaultVar: boolean | undefined;

  const output = {
    ...constructComponent('Checkbox', ({ context }) => ({
      custom_id: `${context.id ? `${context.id}-` : ''}${id}`,
      default: defaultVar,
    })),

    default: (condition = true) => {
      defaultVar = condition;

      return output;
    },
  };

  return output;
}
