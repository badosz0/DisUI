import {
  type APIContainerComponent,
  type APIMessageComponent,
  ButtonStyle,
  ComponentType,
} from 'discord-api-types/v10';
import { render } from '../internal';
import type { DisUIComponent } from './constants';

export type DisUIEmbed = {
  component: APIContainerComponent;
};

const MAX_EMBED_BYTES = 3_000;
const BUTTON_KEYS = new Set(['id', 'type', 'url', 'style', 'label', 'emoji', 'disabled']);
const HTML_ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

function checkPayloadSize(json: string) {
  const bytes = new TextEncoder().encode(json).byteLength;

  if (bytes > MAX_EMBED_BYTES) {
    throw new Error(`Discord component embeds are limited to ${MAX_EMBED_BYTES} bytes; received ${bytes}.`);
  }
}

function validateMedia(url: unknown) {
  if (typeof url !== 'string' || url.length > 2_048) {
    throw new Error('Component embed media must use an HTTP(S) URL of at most 2048 characters.');
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return;
    }
  } catch {
    // Report invalid URLs with the same error as unsupported protocols.
  }

  throw new Error('Component embed media must use an HTTP(S) URL of at most 2048 characters.');
}

/** Resolve a single container to Discord's component-embed JSON payload. */
export function resolveDisUIEmbed(component: DisUIComponent): DisUIEmbed {
  const components = render(component);
  const root = components[0];

  if (components.length !== 1 || root?.type !== ComponentType.Container) {
    throw new Error('A Discord component embed requires exactly one top-level container.');
  }

  let componentCount = 1;
  let galleryItemCount = 0;

  function validate(child: APIMessageComponent, parent: ComponentType) {
    componentCount++;

    switch (child.type) {
      case ComponentType.ActionRow:
        for (const button of child.components) {
          if (button.type !== ComponentType.Button) {
            throw new Error('Component embed action rows can only contain link buttons.');
          }
          validate(button, child.type);
        }
        break;

      case ComponentType.Button:
        if (child.style !== ButtonStyle.Link) {
          throw new Error("Component embeds only support link buttons; use .style('link').");
        }
        if (Object.entries(child).some(([key, value]) => value !== undefined && !BUTTON_KEYS.has(key))) {
          throw new Error('Component embed link buttons contain an unsupported field.');
        }
        if (!child.label && !child.emoji) {
          throw new Error('Component embed link buttons require a label, an emoji, or both.');
        }
        break;

      case ComponentType.Section:
        for (const text of child.components) {
          if (text.type !== ComponentType.TextDisplay) {
            throw new Error('Component embed sections can only contain text displays.');
          }
          validate(text, child.type);
        }
        if (
          !child.accessory ||
          (child.accessory.type !== ComponentType.Button && child.accessory.type !== ComponentType.Thumbnail)
        ) {
          throw new Error('Component embed sections require a link button or thumbnail accessory.');
        }
        validate(child.accessory, child.type);
        break;

      case ComponentType.Thumbnail:
        if (parent !== ComponentType.Section) {
          throw new Error('Component embed thumbnails must be section accessories.');
        }
        validateMedia(child.media.url);
        break;

      case ComponentType.MediaGallery:
        galleryItemCount += child.items.length;
        for (const item of child.items) {
          validateMedia(item.media.url);
        }
        break;

      case ComponentType.TextDisplay:
      case ComponentType.Separator:
        break;

      case ComponentType.Container:
        throw new Error('Component embed containers cannot contain other containers.');

      default:
        throw new Error(`Component type ${child.type} is not supported in Discord component embeds.`);
    }
  }

  for (const child of root.components) {
    validate(child, root.type);
  }

  if (componentCount > 40) {
    throw new Error('Discord component embeds are limited to 40 components, including the container and accessories.');
  }
  if (galleryItemCount > 10) {
    throw new Error('Discord component embeds are limited to 10 gallery items across the entire embed.');
  }

  const payload = { component: root };
  checkPayloadSize(JSON.stringify(payload));
  return payload;
}

/** Render a component embed as a script tag ready for server-rendered HTML. */
export function renderDisUIEmbed(component: DisUIComponent): string {
  const json = JSON.stringify(resolveDisUIEmbed(component)).replace(/[<>&\u2028\u2029]/g, (char) => HTML_ESCAPES[char]);
  checkPayloadSize(json);
  return `<script id="discord:component-embed" type="application/json">${json}</script>`;
}
