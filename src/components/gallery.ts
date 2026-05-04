import type { APIMessageComponent } from 'discord-api-types/v10';
import type { DisUIComponent } from '../core/constants';
import { type ComponentBase, constructComponent, render } from '../internal';
import type { WithFragments } from './fragment';

export interface GalleryComponent extends ComponentBase<'MediaGallery', { items: APIMessageComponent[] }> {}

export type InGalleryComponent = WithFragments<DisUIComponent<'Thumbnail'>>;

export function gallery(...components: (InGalleryComponent | null)[]): GalleryComponent {
  const output = {
    ...constructComponent('MediaGallery', ({ stack, context }) => ({
      items: render(components, [...stack, 'MediaGallery'], context),
    })),
  };

  return output;
}
