import { ComponentType } from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import { container, text, ui } from '../components';
import { resolveDisUI } from '../core';
import { getContainerChildren } from './helpers';

describe('text', () => {
  it('coerces mixed content and merges nested text components', () => {
    const content = text('Alpha', 42, text('Beta').bold(), false).join(' | ');
    const resolved = resolveDisUI(container(content));

    expect(content.toString()).toBe('Alpha | 42 | **Beta**');
    expect(getContainerChildren(resolved)[0]).toMatchObject({
      type: ComponentType.TextDisplay,
      content: 'Alpha | 42 | **Beta**',
    });
  });

  it('applies inline formatting transforms in sequence', () => {
    const resolved = resolveDisUI(
      container(text('Payload').bold().italic().underline().strikethrough().spoiler().link('https://example.com')),
    );

    expect(getContainerChildren(resolved)[0]).toMatchObject({
      content: '[||~~__***Payload***__~~||](https://example.com)',
    });
  });

  it('supports quote, monospace spacing, ordered lists, and code blocks', () => {
    const code = text('first', 'second').list(true).quote().monospace(1).codeblock('ts');
    const resolved = resolveDisUI(container(code));

    expect(code.toString()).toBe('```ts\n` > 1. first\n2. second `\n```');
    expect(getContainerChildren(resolved)[0]).toMatchObject({
      content: '```ts\n` > 1. first\n2. second `\n```',
    });
  });

  it('supports heading sizes and subtext markers', () => {
    const resolved = resolveDisUI(container(text('Title').size('h1'), text('Subtitle').size('sub')));

    expect(getContainerChildren(resolved)).toMatchObject([{ content: '# Title' }, { content: '-# Subtitle' }]);
  });

  it('skips empty heading-only text payloads during rendering', () => {
    const resolved = resolveDisUI(ui(container(text('').size('h1'), text('').size('regular'), text('Visible'))));

    expect(getContainerChildren(resolved)).toMatchObject([{ content: 'Visible' }]);
  });

  it('honors disabled conditional formatting branches', () => {
    const content = text('Safe')
      .bold(false)
      .italic(false)
      .underline(false)
      .monospace(2, false)
      .strikethrough(false)
      .spoiler(false)
      .quote(false);

    expect(content.toString()).toBe('Safe');
    expect(resolveDisUI(container(content)).components?.[0]).toMatchObject({
      type: ComponentType.Container,
    });
  });
});
