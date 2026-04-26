/** biome-ignore-all lint/style/noNonNullAssertion: Test assertions intentionally narrow unions */
import { ComponentType } from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import { button, container, image, row, section, text } from '../components';
import { resolveDisUI } from '../core';
import { DisUISymbol } from '../core/constants';
import { emoji } from '../structures';
import { isDisUIComponent, Store, walkComponents } from '../util';
import { TEST_IDS, TEST_URLS } from './helpers';

describe('emoji', () => {
  it('parses native emoji strings', () => {
    const value = emoji('👍');

    expect(value).toMatchObject({
      name: '👍',
      id: null,
    });
    expect(value.toString()).toBe('👍');
    expect(value.url()).toContain('/1f44d.png');
  });

  it('parses custom emoji strings and preserves animation info', () => {
    const value = emoji(`<a:wave:${TEST_IDS.customEmoji}>`);

    expect(value).toMatchObject({
      id: TEST_IDS.customEmoji,
      name: 'wave',
      animated: true,
    });
    expect(value.toString()).toBe(`<a:wave:${TEST_IDS.customEmoji}>`);
    expect(value.url()).toBe(`https://cdn.discordapp.com/emojis/${TEST_IDS.customEmoji}.gif`);
  });

  it('normalizes raw partial emoji objects', () => {
    const value = emoji({ id: TEST_IDS.customEmoji, name: 'spark', animated: false });

    expect(value).toMatchObject({
      id: TEST_IDS.customEmoji,
      name: 'spark',
      animated: false,
    });
    expect(value.toString()).toBe(`<:spark:${TEST_IDS.customEmoji}>`);
    expect(value.url()).toBe(`https://cdn.discordapp.com/emojis/${TEST_IDS.customEmoji}.png`);
  });

  it('rejects invalid emoji strings', () => {
    expect(() => emoji('not-an-emoji')).toThrowError('Invalid emoji: not-an-emoji');
  });
});

describe('Store', () => {
  const store = new Store({
    count: 'number',
    enabled: 'boolean',
    label: 'string',
    shard: 'bigint',
    userId: 'snowflake',
  });

  it('serializes values in definition order', () => {
    const serialized = store.serialize({
      userId: BigInt(TEST_IDS.user),
      label: 'alpha',
      enabled: true,
      shard: 99n,
      count: 7,
    });

    expect(serialized).toBe('7;1;alpha;99;AvtUSAxCAAA');
  });

  it('deserializes values back to their original types', () => {
    const value = store.deserialize('7;0;beta;100;AvtUSAxCAAA');

    expect(value).toEqual({
      count: 7,
      enabled: false,
      label: 'beta',
      shard: 100n,
      userId: BigInt(TEST_IDS.user),
    });
  });
});

describe('util', () => {
  it('detects DisUI components accurately', () => {
    const value = text('Hello');

    expect(isDisUIComponent(value)).toBe(true);
    expect(isDisUIComponent({ [DisUISymbol]: null })).toBe(true);
    expect(isDisUIComponent('hello')).toBe(false);
    expect(isDisUIComponent(null)).toBe(false);
  });

  it('walks nested container, row, and section trees in depth-first order', () => {
    const resolved = resolveDisUI(
      container(
        text('Header'),
        row(button('Click', 'click')),
        section(text('Body'), image(TEST_URLS.image).alt('Preview')),
      ),
    );

    const visited: ComponentType[] = [];
    walkComponents(resolved.components!, (component) => {
      visited.push(component.type);
    });

    expect(visited).toEqual([
      ComponentType.Container,
      ComponentType.TextDisplay,
      ComponentType.ActionRow,
      ComponentType.Button,
      ComponentType.Section,
      ComponentType.Thumbnail,
      ComponentType.TextDisplay,
    ]);
  });
});
