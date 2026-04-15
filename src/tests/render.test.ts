import { ChannelType } from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import {
  button,
  channelSelect,
  container,
  divider,
  file,
  mentionableSelect,
  roleSelect,
  row,
  text,
  userSelect,
} from '../components';
import { ui } from '../components/ui';
import { resolveDisUI } from '../core';
import { emoji } from '../structures';

describe('render', () => {
  // TODO
  it('', () => {
    const message = ui(
      container(
        text('Hello World').size('h3'),
        divider(),
        row(button('Click me', 'click-me'), button(emoji('👍'), 'like-button').disabled()),
      ).color('#FFF'),
    )
      .mentions('roles', true)
      .mentions('everyone', true)
      .mentions('users', false)
      .ephemeral(true);

    const t = text('Hello World').size('h3');

    console.log(JSON.stringify(resolveDisUI(message), null, 2));
    console.log(JSON.stringify(resolveDisUI(t), null, 2));

    expect(true).toBe(true);
  });

  it('renders entity selects and file', () => {
    const message = ui(
      container(
        row(userSelect('pick-user').placeholder('Pick a user').min(1).max(3).addDefault('214858075650260992')),
        row(roleSelect('pick-role').addDefault('1').setDefaults(['1', '2'])),
        row(
          mentionableSelect('pick-mentionable')
            .placeholder('Pick')
            .addDefaultUser('214858075650260992')
            .addDefaultRole('1'),
        ),
        row(
          channelSelect('pick-channel')
            .placeholder('Pick a channel')
            .types([ChannelType.GuildText, ChannelType.GuildVoice]),
        ),
        file('attachment://example.txt').spoiler(),
      ),
    );

    const resolved = resolveDisUI(message);
    console.log(JSON.stringify(resolved, null, 2));

    expect(resolved.components[0]).toMatchObject({ type: 17 });
  });
});
