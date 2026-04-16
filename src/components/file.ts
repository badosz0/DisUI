import type { DisUIMultipartFile } from '../core/multipart';
import { type ComponentBase, constructComponent } from '../internal';

export interface FileComponent
  extends ComponentBase<
    'File',
    {
      file: { url: string | DisUIMultipartFile };
      spoiler: boolean | undefined;
    }
  > {
  spoiler: (condition?: boolean) => this;
}

export function file(url: string | DisUIMultipartFile | { url: string }): FileComponent {
  let spoilerVar: boolean | undefined;

  const output = {
    ...constructComponent('File', () => ({
      file: {
        url: typeof url === 'object' && 'url' in url ? url.url : url,
      },
      spoiler: spoilerVar,
    })),

    spoiler: (condition = true) => {
      spoilerVar = condition;

      return output;
    },
  };

  return output;
}
