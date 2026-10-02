import { type ComponentBase, constructComponent } from '../internal';

export interface DividerComponent extends ComponentBase<'Divider', { spacing: number; divider: boolean }> {
  large: (condition?: boolean) => this;
  invisible: (condition?: boolean) => this;
}

export function divider(): DividerComponent {
  let largeVar = false;
  let invisibleVar = false;

  const output = {
    ...constructComponent('Divider', () => ({
      spacing: largeVar ? 2 : 1,
      divider: !invisibleVar,
    })),

    large: (condition = true) => {
      largeVar = condition;

      return output;
    },

    invisible: (condition = true) => {
      invisibleVar = condition;

      return output;
    },
  };

  return output;
}
