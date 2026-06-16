import { type APIMessageComponent, ComponentType } from 'discord-api-types/v10';
import { type DisUIComponent, DisUISymbol } from '../core/constants';

export function isDisUIComponent(value: unknown): value is DisUIComponent {
  return typeof value === 'object' && value !== null && DisUISymbol in value;
}

export function walkComponents(components: APIMessageComponent[], callback: (component: APIMessageComponent) => void) {
  for (const component of components) {
    callback(component);

    if (component.type === ComponentType.Container || component.type === ComponentType.ActionRow) {
      walkComponents(component.components, callback);
    }

    if (component.type === ComponentType.Section) {
      walkComponents([component.accessory], callback);
      walkComponents(component.components, callback);
    }
  }
}

export * from './multipart';
export * from './store';
