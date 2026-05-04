import type { APIMessageComponent } from 'discord-api-types/v10';
import type { DisUIComponent } from '../core/constants';
import { type ComponentBase, constructComponent, render } from '../internal';

declare const FragmentChildrenSymbol: unique symbol;

type NullableDisUIComponent = DisUIComponent | null;

export interface FragmentComponent<
  Children extends readonly NullableDisUIComponent[] = readonly NullableDisUIComponent[],
>
  extends ComponentBase<'Fragment', { components: APIMessageComponent[] }> {
  readonly [FragmentChildrenSymbol]?: Children;
}

export type WithFragments<T extends DisUIComponent> = T | FragmentComponent<readonly (WithFragments<T> | null)[]>;

export type SingleWithFragments<T extends DisUIComponent> = WithFragments<T>;

export type UnwrapFragments<T> = T extends FragmentComponent<infer Children> ? UnwrapFragments<Children[number]> : T;

export function fragment<Components extends readonly NullableDisUIComponent[]>(
  ...components: Components
): FragmentComponent<Components> {
  const output = {
    ...constructComponent('Fragment', ({ stack, context }) => ({
      components: render(components, stack, context),
    })),
  };

  return output;
}
