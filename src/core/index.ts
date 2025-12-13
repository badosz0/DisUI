import { type APIMessageTopLevelComponent, MessageFlags } from 'discord-api-types/v10';
import { render } from '../internal';
import type { DisUIComponent } from './constants';

export function ui(...components: DisUIComponent[]) {
  return {
    components: render(components) as APIMessageTopLevelComponent[],
    flags: MessageFlags.IsComponentsV2,
  };
}

export function ephemeral(message: ReturnType<typeof ui>, condition = true) {
  if (!condition) {
    return message;
  }

  return {
    ...message,
    flags: message.flags | MessageFlags.Ephemeral,
  };
}
