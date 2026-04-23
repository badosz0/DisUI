import {
  AllowedMentionsTypes,
  type APIInteractionResponseCallbackData,
  type APIMessageTopLevelComponent,
  MessageFlags,
} from 'discord-api-types/v10';
import type { DisUIAllowedMentionType } from '../components/ui';
import { render } from '../internal';
import { type DisUIComponent, DisUIComponentType, DisUISymbol } from './constants';

export function resolveDisUI(component: DisUIComponent): APIInteractionResponseCallbackData {
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

  return {
    components:
      component[DisUISymbol].type === DisUIComponentType.UI
        ? (rendered.components as APIMessageTopLevelComponent[])
        : (render(component) as APIMessageTopLevelComponent[]),
    flags,
    attachments: [],
    allowed_mentions: {
      parse: allowedMentions,
    },
  };
}

export * from './constants';
