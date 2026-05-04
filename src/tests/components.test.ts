/** biome-ignore-all lint/style/noNonNullAssertion: Test narrowing */
import { ButtonStyle, ComponentType } from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import { button, container, file, gallery, image, row, section, select, text, ui } from '../components';
import { resolveDisUI } from '../core';
import { getContainerChildren, getRowChildren, TEST_IDS, TEST_LABELS, TEST_URLS } from './helpers';

describe('components', () => {
  it('inherits disabled state through containers and rows', () => {
    const resolved = resolveDisUI(
      container(
        row(button('Inherited', 'inherited')).disabled(),
        row(button('Explicit enabled', 'explicit').disabled(false)),
        select('fallback-select'),
      ).disabled(),
    );

    const containerChildren = getContainerChildren(resolved);
    const inheritedButton = getRowChildren(containerChildren[0])[0];
    const explicitButton = getRowChildren(containerChildren[1])[0];
    const inheritedSelect = getRowChildren(containerChildren[2])[0];

    expect(inheritedButton).toMatchObject({ disabled: true });
    expect(explicitButton).toMatchObject({ disabled: false });
    expect(inheritedSelect).toMatchObject({ disabled: true });
  });

  it('supports row mutation and select option lifecycle helpers', () => {
    const menu = select('sizes')
      .addOptions([
        { label: TEST_LABELS.beta, value: 'b' },
        { label: TEST_LABELS.gamma, value: 'g', description: 'Third' },
      ])
      .addOption(TEST_LABELS.alpha, 'a', true, { emoji: { name: '👍' } })
      .sortOptions((a, b) => a.label.localeCompare(b.label))
      .max(99)
      .placeholder('Pick a size');

    const resolved = resolveDisUI(container(row(button('Leading', 'lead')).add(menu)));
    const selectComponent = getRowChildren(getContainerChildren(resolved)[0])[1];

    if (selectComponent.type !== ComponentType.StringSelect) {
      throw new Error('Expected a string select');
    }

    expect(selectComponent.placeholder).toBe('Pick a size');
    expect(selectComponent.max_values).toBe(3);
    expect(selectComponent.options.map((option) => option.label)).toEqual([
      TEST_LABELS.alpha,
      TEST_LABELS.beta,
      TEST_LABELS.gamma,
    ]);
    expect(selectComponent.options[0]).toMatchObject({
      value: 'a',
      default: true,
      emoji: { name: '👍' },
    });
  });

  it('falls back to a disabled empty select when no options are present', () => {
    const resolved = resolveDisUI(container(row(select('empty').placeholder('Unused'))));
    const selectComponent = getRowChildren(getContainerChildren(resolved)[0])[0];

    if (selectComponent.type !== ComponentType.StringSelect) {
      throw new Error('Expected a string select');
    }

    expect(selectComponent).toMatchObject({
      disabled: true,
      options: [{ label: 'No options', value: 'no-options' }],
      placeholder: 'Unused',
    });
    expect(selectComponent.max_values).toBeUndefined();
  });

  it('replaces select options with setOptions', () => {
    const resolved = resolveDisUI(
      container(
        row(
          select('replace-me')
            .addOption('Old', 'old', false)
            .setOptions([
              { label: 'New', value: 'new', description: 'Replaced' },
              { label: 'Latest', value: 'latest' },
            ]),
        ),
      ),
    );

    const selectComponent = getRowChildren(getContainerChildren(resolved)[0])[0];

    if (selectComponent.type !== ComponentType.StringSelect) {
      throw new Error('Expected a string select');
    }

    expect(selectComponent.options).toEqual([
      { label: 'New', value: 'new', description: 'Replaced' },
      { label: 'Latest', value: 'latest' },
    ]);
  });

  it('renders sections as plain text when no accessory is provided', () => {
    const resolved = resolveDisUI(container(section([text('Alpha'), null, text('Beta')], null)));
    const textComponent = getContainerChildren(resolved)[0];

    expect(textComponent).toMatchObject({
      type: ComponentType.TextDisplay,
      content: 'Alpha\nBeta',
    });
  });

  it('renders sections with image accessories', () => {
    const resolved = resolveDisUI(
      container(section([text('Body copy'), text('Supporting line')], image(TEST_URLS.image).alt('Preview image'))),
    );
    const sectionComponent = getContainerChildren(resolved)[0];

    if (sectionComponent.type !== ComponentType.Section) {
      throw new Error('Expected a section');
    }

    expect(sectionComponent.components).toMatchObject([{ content: 'Body copy' }, { content: 'Supporting line' }]);
    expect(sectionComponent.accessory).toMatchObject({
      type: ComponentType.Thumbnail,
      media: { url: TEST_URLS.image },
      description: 'Preview image',
    });
  });

  it('renders gallery images without nested thumbnail type markers', () => {
    const resolved = resolveDisUI(
      container(gallery(image(TEST_URLS.image), null, image({ url: TEST_URLS.docs }).spoiler())),
    );
    const galleryComponent = getContainerChildren(resolved)[0];

    if (galleryComponent.type !== ComponentType.MediaGallery) {
      throw new Error('Expected a media gallery');
    }

    expect(galleryComponent.items).toHaveLength(2);
    expect(galleryComponent.items[0]).toMatchObject({
      media: { url: TEST_URLS.image },
    });
    expect('type' in galleryComponent.items[0] ? galleryComponent.items[0].type : undefined).toBeUndefined();
    expect(galleryComponent.items[1]).toMatchObject({
      media: { url: TEST_URLS.docs },
      spoiler: true,
    });
  });

  it('renders link buttons and emoji buttons correctly', () => {
    const resolved = resolveDisUI(
      container(
        row(
          button('Docs', TEST_URLS.docs).style('link'),
          button('React', 'react').emoji(`<:wave:${TEST_IDS.customEmoji}>`),
          button({ name: '🔥', id: null }, 'fire'),
        ),
      ),
    );
    const [linkButton, emojiButton, onlyEmojiButton] = getRowChildren(getContainerChildren(resolved)[0]);

    expect(linkButton).toMatchObject({
      style: ButtonStyle.Link,
      url: TEST_URLS.docs,
    });
    expect('custom_id' in linkButton ? linkButton.custom_id : undefined).toBeUndefined();

    expect(emojiButton).toMatchObject({
      style: ButtonStyle.Primary,
      custom_id: 'react',
      emoji: { id: TEST_IDS.customEmoji, name: 'wave', animated: false },
    });
    expect(onlyEmojiButton).toMatchObject({
      label: undefined,
      custom_id: 'fire',
      emoji: { name: '🔥', id: null },
    });
  });

  it('supports container color, spoiler, ids, and file object urls', () => {
    const resolved = resolveDisUI(
      container(file({ url: TEST_URLS.file }), button('Open', 'launch'))
        .color('#A0B1C2')
        .spoiler()
        .id('panel'),
    );
    const [fileComponent, buttonRow] = getContainerChildren(resolved);
    const buttonComponent = getRowChildren(buttonRow)[0];

    expect(resolved.components?.[0]).toMatchObject({
      accent_color: 0xa0b1c2,
      spoiler: true,
    });
    expect(fileComponent).toMatchObject({
      type: ComponentType.File,
      file: { url: TEST_URLS.file },
    });
    expect(buttonComponent).toMatchObject({
      custom_id: 'panel-launch',
    });
  });

  it('auto-wraps bare interactive components in rows', () => {
    const resolved = resolveDisUI(
      ui(
        button('Open', 'open'),
        select('pick-size').addOption('Medium', 'm', false),
      ),
    );

    expect(resolved.components).toMatchObject([
      {
        type: ComponentType.ActionRow,
        components: [{ type: ComponentType.Button, custom_id: 'open' }],
      },
      {
        type: ComponentType.ActionRow,
        components: [{ type: ComponentType.StringSelect, custom_id: 'pick-size' }],
      },
    ]);
  });

  it('preserves select default value types for downstream Discord payloads', () => {
    const resolved = resolveDisUI(
      container(row(select('typed').addOption('One', '1', false).addOption('Two', '2', true))),
    );
    const selectComponent = getRowChildren(getContainerChildren(resolved)[0])[0];

    if (selectComponent.type !== ComponentType.StringSelect) {
      throw new Error('Expected a string select');
    }

    expect(selectComponent.options.find((option) => option.value === '2')).toMatchObject({
      default: true,
    });
  });
});
