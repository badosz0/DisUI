import {
  AllowedMentionsTypes,
  type APIInteractionResponseCallbackData,
  type APIMessageComponent,
  type APIMessageTopLevelComponent,
  ComponentType,
  MessageFlags,
} from 'discord-api-types/v10';
import type { DisUIAllowedMentionType } from '../components/ui';
import { render } from '../internal';
import { walkComponents } from '../util';
import { type DisUIComponent, DisUIComponentType, DisUISymbol } from './constants';
import type { DisUIResolvedFile, DisUIMultipartFile } from './multipart';

export * from './multipart';

export interface ResolvedDisUI extends APIInteractionResponseCallbackData {
  files: DisUIResolvedFile[];
}

function isMultipartFile(value: unknown): value is DisUIMultipartFile {
  return (
    typeof value === 'object' && value !== null && 'name' in value && 'data' in value && Buffer.isBuffer(value.data)
  );
}

function attachmentUrl(name: string) {
  return `attachment://${name}`;
}

function collectAttachment(
  media: { url: string | DisUIMultipartFile },
  attachments: NonNullable<APIInteractionResponseCallbackData['attachments']>,
  files: DisUIResolvedFile[],
) {
  if (!isMultipartFile(media.url)) {
    return;
  }

  const index = attachments.length;
  const file = media.url;

  attachments.push({
    id: index,
    filename: file.name,
  });
  files.push({
    ...file,
    key: file.key ?? `files[${index}]`,
  });
  media.url = attachmentUrl(file.name);
}

function resolveAttachments(components: APIMessageTopLevelComponent[]) {
  const attachments: NonNullable<APIInteractionResponseCallbackData['attachments']> = [];
  const files: DisUIResolvedFile[] = [];

  walkComponents(components as APIMessageComponent[], (component) => {
    if (component.type === ComponentType.File) {
      collectAttachment(component.file, attachments, files);
    }

    if (component.type === ComponentType.Thumbnail) {
      collectAttachment(component.media, attachments, files);
    }

    if (component.type === ComponentType.MediaGallery) {
      for (const item of component.items) {
        collectAttachment(item.media, attachments, files);
      }
    }
  });

  return { attachments, files };
}

export function resolveDisUI(component: DisUIComponent): ResolvedDisUI {
  const rendered = component[DisUISymbol].render({ stack: [], context: {} });
  const components =
    component[DisUISymbol].type === DisUIComponentType.UI
      ? (rendered.components as APIMessageTopLevelComponent[])
      : (render(component) as APIMessageTopLevelComponent[]);
  const { attachments, files } = resolveAttachments(components);

  let flags = MessageFlags.IsComponentsV2;
  let allowedMentions: AllowedMentionsTypes[] = [AllowedMentionsTypes.User];

  if (rendered.ephemeral) {
    flags |= MessageFlags.Ephemeral;
  }

  if (rendered.mentions) {
    allowedMentions = [];

    for (const mention of rendered.mentions as DisUIAllowedMentionType[]) {
      allowedMentions.push(
        {
          users: AllowedMentionsTypes.User,
          roles: AllowedMentionsTypes.Role,
          everyone: AllowedMentionsTypes.Everyone,
        }[mention],
      );
    }
  }

  return {
    components,
    flags,
    attachments,
    allowed_mentions: {
      parse: allowedMentions,
    },
    files,
  };
}
