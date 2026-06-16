import {
  AllowedMentionsTypes,
  type APIInteractionResponseCallbackData,
  type APIMessageTopLevelComponent,
  MessageFlags,
} from 'discord-api-types/v10';
import type { DisUIAllowedMentionType } from '../components/ui';
import { render } from '../internal';
import { type MultipartFile, resolveMultipartFiles } from '../util/multipart';
import { type DisUIComponent, DisUIComponentType, DisUISymbol } from './constants';

export type ResolvedDisUI = {
  data: APIInteractionResponseCallbackData;
  files: MultipartFile[];
};

export function resolveDisUI(component: DisUIComponent): ResolvedDisUI {
  const rendered = component[DisUISymbol].render({ stack: [], context: {} });

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

  const components =
    component[DisUISymbol].type === DisUIComponentType.UI
      ? (rendered.components as APIMessageTopLevelComponent[])
      : (render(component) as APIMessageTopLevelComponent[]);

  const files = resolveMultipartFiles(components);

  return {
    data: {
      components,
      flags,
      attachments: [],
      allowed_mentions: {
        parse: allowedMentions,
      },
    },
    files,
  };
}

export * from './constants';
