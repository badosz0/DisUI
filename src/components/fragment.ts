import type { APIMessageComponent } from 'discord-api-types/v10';
import type { DisUIComponent } from '../core/constants';
import { type ComponentBase, constructComponent, render } from '../internal';

interface FragmentComponent extends ComponentBase<'Fragment', { components: APIMessageComponent[] }> {}

export function fragment(...components: DisUIComponent[]): FragmentComponent {
  const output = {
    ...constructComponent('Fragment', ({ context }) => ({
      components: render(components, [], context),
    })),
  };

  return output;
}
