import { type DisUIComponent, DisUISymbol } from '../core/constants';

export function isDisUIComponent(value: unknown): value is DisUIComponent {
  return typeof value === 'object' && value !== null && DisUISymbol in value;
}

export * from './store';
