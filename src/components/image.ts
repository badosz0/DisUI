import { DisUIComponentType } from '../core/constants';
import { constructComponent } from '../internal';

type MultipartFile = {
  name: string;
  data: Buffer;
  contentType?: string;
  key?: string;
};

export function image(url: string | MultipartFile | { url: string }) {
  let altVar: string | undefined;
  let spoilerVar: boolean | undefined;

  const output = {
    ...constructComponent('Thumbnail', ({ stack }) => ({
      type: stack.at(-1) === 'MediaGallery' ? undefined : DisUIComponentType.Thumbnail,
      media: {
        url: typeof url === 'object' && 'url' in url ? url.url : url,
      },
      description: altVar,
      spoiler: spoilerVar,
    })),

    alt: (alt: string) => {
      altVar = alt;

      return output;
    },

    spoiler: (condition = true) => {
      spoilerVar = condition;

      return output;
    },
  };

  return output;
}
