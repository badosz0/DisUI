import type { APIMessageComponent } from 'discord-api-types/v10';
import { type DisUIComponent, DisUIComponentType, type DisUIComponentTypeName, DisUISymbol } from '../core/constants';

const AUTO_WRAP_WITH_ROW = new Set<number>([
  DisUIComponentType.Button,
  DisUIComponentType.Select,
  DisUIComponentType.UserSelect,
  DisUIComponentType.RoleSelect,
  DisUIComponentType.MentionableSelect,
  DisUIComponentType.ChannelSelect,
]);

export type ComponentBase<T extends DisUIComponentTypeName, D> = {
  [DisUISymbol]: {
    type: (typeof DisUIComponentType)[T];
    render: (options: { stack: DisUIComponentTypeName[]; context: Record<string, unknown> }) => D;
  };
};

export function constructComponent<
  Type extends DisUIComponentTypeName,
  D extends Record<string, unknown> = Record<string, unknown>,
>(type: Type, render: DisUIComponent<Type, D>[typeof DisUISymbol]['render']): DisUIComponent<Type, D> {
  const output = {
    [DisUISymbol]: {
      type: DisUIComponentType[type],
      render,
    },
  };

  return output;
}

function render(
  components: readonly (DisUIComponent | null)[],
  stack?: DisUIComponentTypeName[],
  context?: Record<string, unknown>,
): APIMessageComponent[];
function render(...components: Array<DisUIComponent | null>): APIMessageComponent[];
function render(
  ...args:
    | [readonly (DisUIComponent | null)[], DisUIComponentTypeName[]?, Record<string, unknown>?]
    | Array<DisUIComponent | null>
): APIMessageComponent[] {
  let components: readonly (DisUIComponent | null)[];
  let stack: DisUIComponentTypeName[] | undefined;
  let context: Record<string, unknown> | undefined;

  if (Array.isArray(args[0])) {
    components = args[0];
    stack = (args[1] as DisUIComponentTypeName[]) ?? [];
    context = (args[2] as Record<string, unknown>) ?? {};
  } else {
    components = args as Array<DisUIComponent | null>;
    stack = [];
    context = {};
  }

  const payload: APIMessageComponent[] = [];

  for (let i = 0; i < components.length; i++) {
    const component = components[i];

    if (!component) {
      continue;
    }

    const data = component[DisUISymbol];
    const r = data.render({ stack, context });

    if (data.type === DisUIComponentType.Fragment || data.type === DisUIComponentType.UI) {
      payload.push(...(r.components as APIMessageComponent[]));
      continue;
    }

    if (data.type === DisUIComponentType.Text && ['#', '##', '###', '-#', ''].includes((r.content as string).trim())) {
      continue;
    }

    const apiComponent = {
      type: data.type,
      ...r,
    } as APIMessageComponent;
    const parent = stack.at(-1);

    if (AUTO_WRAP_WITH_ROW.has(data.type) && parent !== 'Row' && parent !== 'Section') {
      payload.push({
        type: DisUIComponentType.Row,
        components: [apiComponent],
      } as APIMessageComponent);
      continue;
    }

    payload.push(apiComponent);
  }

  return payload;
}

export { render };
