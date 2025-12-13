import type { APIMessageComponent } from 'discord-api-types/v10';
import { type DisUIComponent, DisUIComponentType, type DisUIComponentTypeName, DisUISymbol } from '../core/constants';

export function constructComponent<Type extends DisUIComponentTypeName>(
  type: Type,
  render: DisUIComponent<Type>[typeof DisUISymbol]['render'],
): DisUIComponent<Type> {
  const output = {
    [DisUISymbol]: {
      type: DisUIComponentType[type],
      render,
    },
  };

  return output;
}

function render(
  components: Array<DisUIComponent | null>,
  stack?: DisUIComponentTypeName[],
  context?: Record<string, unknown>,
): APIMessageComponent[];
function render(...components: Array<DisUIComponent | null>): APIMessageComponent[];
function render(
  ...args:
    | [Array<DisUIComponent | null>, DisUIComponentTypeName[]?, Record<string, unknown>?]
    | Array<DisUIComponent | null>
): APIMessageComponent[] {
  let components: Array<DisUIComponent | null>;
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

    if (data.type === DisUIComponentType.Fragment) {
      payload.push(...(r.components as APIMessageComponent[]));
      continue;
    }

    if (data.type === DisUIComponentType.Text && ['#', '##', '###', '-#', ''].includes((r.content as string).trim())) {
      continue;
    }

    payload.push({
      type: data.type,
      ...r,
    } as APIMessageComponent);
  }

  return payload;
}

export { render };
