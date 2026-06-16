import type { APIMessageTopLevelComponent } from 'discord-api-types/v10';

export type MultipartFile = {
  name: string;
  data: Buffer;
  contentType?: string;
  key?: string;
};

type MediaReference = {
  url?: unknown;
};

type ComponentWithMultipartReferences = {
  media?: MediaReference;
  file?: MediaReference;
  components?: unknown;
  items?: unknown;
  accessory?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isMultipartFile(value: unknown): value is MultipartFile {
  return isRecord(value) && typeof value.name === 'string' && 'data' in value;
}

function resolveMediaReference(reference: MediaReference | undefined, files: MultipartFile[]) {
  if (!reference || !isMultipartFile(reference.url)) {
    return;
  }

  files.push(reference.url);
  reference.url = `attachment://${reference.url.name}`;
}

function collectMultipartFiles(component: unknown, files: MultipartFile[]) {
  if (!isRecord(component)) {
    return;
  }

  const renderedComponent = component as ComponentWithMultipartReferences;

  resolveMediaReference(renderedComponent.media, files);
  resolveMediaReference(renderedComponent.file, files);

  if (Array.isArray(renderedComponent.components)) {
    for (const child of renderedComponent.components) {
      collectMultipartFiles(child, files);
    }
  }

  if (Array.isArray(renderedComponent.items)) {
    for (const child of renderedComponent.items) {
      collectMultipartFiles(child, files);
    }
  }

  collectMultipartFiles(renderedComponent.accessory, files);
}

export function resolveMultipartFiles(components: APIMessageTopLevelComponent[]) {
  const files: MultipartFile[] = [];

  for (const component of components) {
    collectMultipartFiles(component, files);
  }

  return files;
}
