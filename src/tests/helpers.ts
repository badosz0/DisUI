import type { APIInteractionResponseCallbackData, APIMessageComponent } from 'discord-api-types/v10';
import { ComponentType } from 'discord-api-types/v10';

export const TEST_IDS = {
  user: '214858075650260992',
  role: '845587236549271552',
  roleAlt: '999999999999999999',
  channel: '123456789012345678',
  channelAlt: '234567890123456789',
  customEmoji: '987654321098765432',
} as const;

export const TEST_URLS = {
  docs: 'https://example.com/docs',
  image: 'https://example.com/image.png',
  file: 'attachment://example.txt',
} as const;

export const TEST_LABELS = {
  alpha: 'Alpha',
  beta: 'Beta',
  gamma: 'Gamma',
} as const;

export function getContainerChildren(input: APIInteractionResponseCallbackData | APIMessageComponent) {
  const component = isResponsePayload(input) ? input.components?.[0] : input;

  if (!component) {
    throw new Error('Expected a top-level container component');
  }

  return getContainerComponents(component);
}

export function getContainerComponents(component: APIMessageComponent) {
  if (component.type !== ComponentType.Container) {
    throw new Error('Expected a container component');
  }

  return component.components;
}

function isResponsePayload(
  input: APIInteractionResponseCallbackData | APIMessageComponent,
): input is APIInteractionResponseCallbackData {
  return !('type' in input);
}

export function getRowChildren(component: APIMessageComponent) {
  if (component.type !== ComponentType.ActionRow) {
    throw new Error('Expected an action row');
  }

  return component.components;
}
