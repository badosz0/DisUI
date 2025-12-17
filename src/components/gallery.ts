import type { APIMessageComponent } from 'discord-api-types/v10';
import type { DisUIComponent } from '../core/constants';
import { type ComponentBase, constructComponent, render } from '../internal';

interface GalleryComponent extends ComponentBase<'MediaGallery', { items: APIMessageComponent[] }> {}

export function gallery(...components: DisUIComponent<'Thumbnail'>[]): GalleryComponent {
  const output = {
    ...constructComponent('MediaGallery', ({ stack, context }) => ({
      items: render(components, [...stack, 'MediaGallery'], context),
    })),
  };

  return output;
}
