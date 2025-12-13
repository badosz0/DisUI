import type { DisUIComponent } from '../core/constants';
import { constructComponent, render } from '../internal';

export function fragment(...components: DisUIComponent[]) {
  const output = {
    ...constructComponent('Fragment', ({ context }) => ({
      components: render(components, [], context),
    })),
  };

  return output;
}
