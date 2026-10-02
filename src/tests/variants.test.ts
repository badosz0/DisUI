/** biome-ignore-all lint/style/noNonNullAssertion: Test narrowing */
import { AllowedMentionsTypes, ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import { button, container, file, fragment, image, row, text, ui } from '../components';
import { resolveDisUI } from '../core';
import { getContainerChildren, getRowChildren, TEST_URLS } from './helpers';

describe('variants', () => {
  it('maps button style helpers to Discord button styles', () => {
    const resolved = resolveDisUI(
      container(
        row(
          button('Primary', 'primary'),
          button('Secondary', 'secondary').style('secondary'),
          button('Success', 'success').style('success'),
          button('Danger', 'danger').style('danger'),
        ),
      ),
    );
    const buttons = getRowChildren(getContainerChildren(resolved.data)[0]);

    expect(buttons.map((component) => ('style' in component ? component.style : undefined))).toEqual([
      ButtonStyle.Primary,
      ButtonStyle.Secondary,
      ButtonStyle.Success,
      ButtonStyle.Danger,
    ]);
  });

  it('keeps explicit button disabled false under inherited disabled rows', () => {
    const resolved = resolveDisUI(container(row(button('A', 'a'), button('B', 'b').disabled(false)).disabled()));
    const [inheritedButton, explicitButton] = getRowChildren(getContainerChildren(resolved.data)[0]);

    expect(inheritedButton).toMatchObject({ disabled: true });
    expect(explicitButton).toMatchObject({ disabled: false });
  });

  it('renders image components outside galleries with thumbnail type metadata', () => {
    const resolved = resolveDisUI(container(image(TEST_URLS.image).alt('Standalone').spoiler()));
    const imageComponent = getContainerChildren(resolved.data)[0];

    expect(imageComponent).toMatchObject({
      type: ComponentType.Thumbnail,
      media: { url: TEST_URLS.image },
      description: 'Standalone',
      spoiler: true,
    });
  });

  it('renders files from multipart-like objects', () => {
    const multipartFile = {
      name: 'report.txt',
      data: Buffer.from('report'),
    };
    const resolved = resolveDisUI(container(file(multipartFile)));
    const fileComponent = getContainerChildren(resolved.data)[0];

    expect(resolved.files).toEqual([multipartFile]);
    expect(fileComponent).toMatchObject({
      type: ComponentType.File,
      file: {
        url: 'attachment://report.txt',
      },
    });
  });

  it('supports numeric container colors without conversion', () => {
    const resolved = resolveDisUI(container(text('Palette')).color(0xabcdef));

    expect(resolved.data.components?.[0]).toMatchObject({
      accent_color: 0xabcdef,
    });
  });

  it('retains mention insertion order while removing disabled mentions', () => {
    const resolved = resolveDisUI(ui(text('Hello')).mentions('roles').mentions('everyone').mentions('roles', false));

    expect(resolved.data.allowed_mentions).toEqual({
      parse: [AllowedMentionsTypes.User, AllowedMentionsTypes.Everyone],
    });
  });

  it('renders fragments directly at the top level through resolveDisUI', () => {
    const resolved = resolveDisUI(fragment(text('One'), text('Two')));

    expect(resolved.data.components).toMatchObject([
      { type: ComponentType.TextDisplay, content: 'One' },
      { type: ComponentType.TextDisplay, content: 'Two' },
    ]);
  });

  it('uses newline joins for both plain text rendering and toString', () => {
    const content = text('One', 'Two', 'Three');
    const resolved = resolveDisUI(container(content));

    expect(content.toString()).toBe('One\nTwo\nThree');
    expect(String(content)).toBe('One\nTwo\nThree');
    expect(getContainerChildren(resolved.data)[0]).toMatchObject({
      content: 'One\nTwo\nThree',
    });
  });
});
