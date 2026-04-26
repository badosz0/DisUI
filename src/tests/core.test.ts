/** biome-ignore-all lint/style/noNonNullAssertion: Test narrowing */
import { AllowedMentionsTypes, ComponentType, MessageFlags } from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import { button, container, divider, fragment, row, text, ui } from '../components';
import { resolveDisUI } from '../core';
import { DisUIComponentType, DisUISymbol } from '../core/constants';
import { constructComponent, render } from '../internal';
import { getContainerChildren, getRowChildren } from './helpers';

describe('core', () => {
  it('constructComponent assigns the expected internal type marker', () => {
    const component = constructComponent('Divider', () => ({ spacing: 1, divider: true }));

    expect(component[DisUISymbol].type).toBe(DisUIComponentType.Divider);
    expect(component[DisUISymbol].render({ stack: [], context: {} })).toEqual({
      spacing: 1,
      divider: true,
    });
  });

  it('resolveDisUI keeps default non-ephemeral flags for ui payloads', () => {
    const resolved = resolveDisUI(ui(container(text('Hello'))));

    expect(resolved.flags).toBe(MessageFlags.IsComponentsV2);
    expect(resolved.allowed_mentions).toEqual({
      parse: [AllowedMentionsTypes.User],
    });
  });

  it('render skips nullish components and empty text markers', () => {
    const output = render(null, text('').size('h2'), divider(), fragment(text('Visible')), null);

    expect(output).toHaveLength(2);
    expect(output[0]).toMatchObject({
      type: ComponentType.Separator,
      divider: true,
    });
    expect(output[1]).toMatchObject({
      type: ComponentType.TextDisplay,
      content: 'Visible',
    });
  });

  it('render flattens nested ui and fragment components', () => {
    const output = render(fragment(text('One'), text('Two')), ui(container(row(button('Three', 'three')))));

    expect(output).toMatchObject([
      { type: ComponentType.TextDisplay, content: 'One' },
      { type: ComponentType.TextDisplay, content: 'Two' },
      { type: ComponentType.Container },
    ]);
  });

  it('passes stack and context through nested render calls', () => {
    const captured = constructComponent('Text', ({ stack, context }) => ({
      content: `${stack.join('>')}|${String(context.id)}|${String(context.disabled)}`,
    }));
    const resolved = resolveDisUI(
      container(row(captured as never))
        .id('panel')
        .disabled(),
    );
    const textComponent = getRowChildren(getContainerChildren(resolved)[0])[0];

    expect(textComponent).toMatchObject({
      type: ComponentType.TextDisplay,
      content: 'Container>Row|panel|true',
    });
  });

  it('divider variants update spacing and visibility flags', () => {
    const resolved = resolveDisUI(
      container(divider(), divider().large(), divider().invisible(), divider().large().invisible()),
    );

    expect(getContainerChildren(resolved)).toMatchObject([
      { type: ComponentType.Separator, spacing: 1, divider: true },
      { type: ComponentType.Separator, spacing: 2, divider: true },
      { type: ComponentType.Separator, spacing: 1, divider: false },
      { type: ComponentType.Separator, spacing: 2, divider: false },
    ]);
  });
});
