import { type ComponentBase, constructComponent } from '../internal';

type MultipartFile = {
  name: string;
  data: Buffer;
  contentType?: string;
  key?: string;
};

export interface FileComponent
  extends ComponentBase<
    'File',
    {
      file: { url: string | MultipartFile };
      spoiler: boolean | undefined;
    }
  > {
  spoiler: (condition?: boolean) => this;
}

export function file(url: string | MultipartFile | { url: string }): FileComponent {
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
