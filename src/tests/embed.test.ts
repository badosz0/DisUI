import { ComponentType } from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import {
  button,
  container,
  divider,
  file,
  fragment,
  gallery,
  image,
  input,
  label,
  row,
  section,
  select,
  text,
  ui,
} from '../components';
import { renderDisUIEmbed, resolveDisUI, resolveDisUIEmbed } from '../core';
import { constructComponent } from '../internal';

function scriptJSON(html: string) {
  return html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'));
}

describe('component embeds', () => {
  it('renders supported layouts in the component-embed envelope without message metadata', () => {
    const message = ui(
      container(
        section(text('Release').size('h1'), button('Read more', 'https://example.com/post').style('link')),
        section(text('Details'), image('https://example.com/thumbnail.png').alt('Thumbnail')),
        gallery(fragment(image('https://example.com/one.png'), image('https://example.com/two.png').spoiler())),
        divider().large(false).invisible(),
        row(button('Docs', 'https://example.com/docs').style('link').disabled()),
      )
        .color(0x5865f2)
        .spoiler()
        .id('preview'),
    ).ephemeral();

    const payload = resolveDisUIEmbed(message);
    expect(payload).toEqual({ component: resolveDisUI(message).data.components?.[0] });
    expect(payload.component).toMatchObject({ type: ComponentType.Container, accent_color: 0x5865f2, spoiler: true });

    const html = renderDisUIEmbed(message);
    expect(html).toMatch(/^<script id="discord:component-embed" type="application\/json">.*<\/script>$/);
    expect(JSON.parse(scriptJSON(html))).toEqual(JSON.parse(JSON.stringify(payload)));
    expect(scriptJSON(html)).not.toContain('custom_id');
  });

  it('accepts a container directly or inside a fragment', () => {
    const component = container(text('Preview'));
    expect(resolveDisUIEmbed(fragment(null, component))).toEqual(resolveDisUIEmbed(component));
  });

  it('requires exactly one top-level container', () => {
    for (const component of [text('No container'), ui(), ui(container(text('One')), container(text('Two')))]) {
      expect(() => resolveDisUIEmbed(component)).toThrow('exactly one top-level container');
    }
    expect(() => resolveDisUIEmbed(ui(container(text('One')), text('Outside')))).toThrow(
      'exactly one top-level container',
    );
  });

  it('rejects interaction buttons, selects, file components, and modal inputs', () => {
    expect(() => resolveDisUIEmbed(container(button('Click', 'click')))).toThrow('only support link buttons');
    expect(() => resolveDisUIEmbed(container(select('choice')))).toThrow('action rows can only contain link buttons');
    expect(() => resolveDisUIEmbed(container(file('https://example.com/file.txt')))).toThrow('not supported');
    expect(() => resolveDisUIEmbed(ui(container(text('Preview')), label('Name', input('name'))))).toThrow(
      'exactly one top-level container',
    );
  });

  it('rejects nested containers and standalone thumbnails', () => {
    const nested = constructComponent('Container', () => ({
      components: [resolveDisUIEmbed(container(text('Inner'))).component],
    }));
    expect(() => resolveDisUIEmbed(nested)).toThrow('cannot contain other containers');
    expect(() => resolveDisUIEmbed(container(image('https://example.com/image.png')))).toThrow('section accessories');
  });

  it('rejects extra serialized button fields while allowing undefined fields from link builders', () => {
    const invalidButton = constructComponent('Button', () => ({
      style: 5,
      url: 'https://example.com',
      label: 'Open',
      custom_id: 'not-allowed',
    }));
    const invalidContainer = constructComponent('Container', () => ({
      components: resolveDisUI(invalidButton).data.components,
    }));
    expect(() => resolveDisUIEmbed(invalidContainer)).toThrow('unsupported field');
    expect(() => resolveDisUIEmbed(container(button('Open', 'https://example.com').style('link')))).not.toThrow();
    expect(() => resolveDisUIEmbed(container(button('', 'https://example.com').style('link')))).toThrow(
      'require a label',
    );
  });

  it('rejects uploaded media, relative URLs, unsupported protocols, and overlong URLs', () => {
    for (const url of [
      'attachment://image.png',
      '/image.png',
      'data:image/png;base64,AA==',
      `https://e.co/${'a'.repeat(2_048)}`,
    ]) {
      expect(() => resolveDisUIEmbed(container(gallery(image(url))))).toThrow('HTTP(S) URL');
    }
    const upload = { name: 'image.png', data: Buffer.from('image') };
    expect(() => resolveDisUIEmbed(container(section(text('Preview'), image(upload))))).toThrow('HTTP(S) URL');
    expect(() => resolveDisUIEmbed(container(gallery(image(upload))))).toThrow('HTTP(S) URL');
    expect(() => resolveDisUIEmbed(container(gallery(image('http://example.com/image.png'))))).not.toThrow();
  });

  it('counts section accessories toward the 40-component limit', () => {
    const rows = Array.from({ length: 6 }, () =>
      row(...Array.from({ length: 5 }, () => button('A', 'https://e.co').style('link'))),
    );
    const accessory = section(text('Details'), image('https://e.co/i.png'));
    expect(() => resolveDisUIEmbed(container(...rows, accessory))).not.toThrow();
    expect(() => resolveDisUIEmbed(container(...rows, accessory, text('Extra')))).toThrow('40 components');
  });

  it('limits gallery items across the whole embed and excludes thumbnails', () => {
    const images = Array.from({ length: 5 }, () => image('https://e.co/i.png'));
    const thumbnail = section(text('Details'), image('https://e.co/thumbnail.png'));
    expect(() => resolveDisUIEmbed(container(gallery(...images), gallery(...images), thumbnail))).not.toThrow();
    expect(() =>
      resolveDisUIEmbed(container(gallery(...images), gallery(...images, image('https://e.co/extra.png')))),
    ).toThrow('10 gallery items');
  });

  it('measures the 3000-byte limit in UTF-8 and accepts the exact boundary', () => {
    const overhead = Buffer.byteLength(JSON.stringify(resolveDisUIEmbed(container(text('x'))))) - 1;
    const exact = container(text('x'.repeat(3_000 - overhead)));
    expect(Buffer.byteLength(scriptJSON(renderDisUIEmbed(exact)))).toBe(3_000);
    expect(() => resolveDisUIEmbed(container(text('x'.repeat(3_001 - overhead))))).toThrow('3000 bytes');
    expect(() => resolveDisUIEmbed(container(text('🙂'.repeat(750))))).toThrow('3000 bytes');
  });

  it('escapes HTML-sensitive content without changing the parsed JSON', () => {
    const content = '</ScRiPt><script>alert("injection")</script><!--<script> & \u2028\u2029';
    const html = renderDisUIEmbed(container(text(content)));
    expect(scriptJSON(html)).not.toMatch(/[<>&\u2028\u2029]/);
    expect(JSON.parse(scriptJSON(html)).component.components[0].content).toBe(content);
    expect(html.match(/<script/g)).toHaveLength(1);
  });

  it('checks inline payload size after HTML escaping', () => {
    const component = container(text('<'.repeat(500)));
    expect(() => resolveDisUIEmbed(component)).not.toThrow();
    expect(() => renderDisUIEmbed(component)).toThrow('3000 bytes');
  });
});
