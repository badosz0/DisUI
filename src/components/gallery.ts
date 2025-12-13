import type { DisUIComponent } from '../core/constants';
import { constructComponent, render } from '../internal';

export function gallery(...components: DisUIComponent<'Thumbnail'>[]) {
  const output = {
    ...constructComponent('MediaGallery', ({ stack, context }) => ({
      items: render(components, [...stack, 'MediaGallery'], context),
    })),
  };

  return output;
}
