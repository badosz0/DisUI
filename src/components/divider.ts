import { constructComponent } from '../internal';

export function divider() {
  let largeVar = false;
  let invisibleVar = false;

  const output = {
    ...constructComponent('Divider', () => ({
      spacing: largeVar ? 2 : 1,
      divider: !invisibleVar,
    })),

    large: () => {
      largeVar = true;

      return output;
    },

    invisible: (condition = true) => {
      invisibleVar = condition;

      return output;
    },
  };

  return output;
}
