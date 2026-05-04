/** biome-ignore-all lint/style/noNonNullAssertion: TODO */
import { AllowedMentionsTypes, ChannelType, ComponentType, MessageFlags } from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import {
  button,
  channelSelect,
  container,
  divider,
  file,
  fragment,
  mentionableSelect,
  roleSelect,
  row,
  select,
  text,
  userSelect,
} from '../components';
import { ui } from '../components/ui';
import { resolveDisUI } from '../core';
import { emoji } from '../structures';
import { getContainerChildren, getRowChildren, TEST_IDS, TEST_URLS } from './helpers';

describe('render', () => {
  it('renders ui flags and mentions', () => {
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

    const resolved = resolveDisUI(message);

    expect(resolved.flags).toBe(MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral);
    expect(resolved.allowed_mentions).toEqual({
      parse: [AllowedMentionsTypes.Role, AllowedMentionsTypes.Everyone],
    });

    const containerChildren = getContainerChildren(resolved);
    const buttonChildren = getRowChildren(containerChildren[2]);

    expect(buttonChildren).toMatchObject([
      { custom_id: 'click-me', disabled: false },
      { custom_id: 'like-button', disabled: true, emoji: { name: '👍', id: null } },
    ]);
  });

  it('handles mention toggles idempotently', () => {
    const noOpDisable = resolveDisUI(ui(text('Hello World')).mentions('roles', false));
    const duplicateEnable = resolveDisUI(ui(text('Hello World')).mentions('roles', true).mentions('roles', true));
    const repeatedDisable = resolveDisUI(
      ui(text('Hello World')).mentions('roles', true).mentions('users', false).mentions('users', false),
    );

    expect(noOpDisable.allowed_mentions).toEqual({
      parse: [AllowedMentionsTypes.User],
    });
    expect(duplicateEnable.allowed_mentions).toEqual({
      parse: [AllowedMentionsTypes.User, AllowedMentionsTypes.Role],
    });
    expect(repeatedDisable.allowed_mentions).toEqual({
      parse: [AllowedMentionsTypes.Role],
    });
  });

  it('prefixes nested custom ids for interactive components', () => {
    const message = ui(
      container(
        row(button('Click me', 'click-me')),
        row(button('Docs', 'https://example.com').style('link')),
        row(select('pick-size').addOption('Medium', 'm', false)),
        row(userSelect('pick-user')),
        row(roleSelect('pick-role')),
        row(mentionableSelect('pick-mentionable')),
        row(channelSelect('pick-channel')),
      ).id('settings'),
    );

    const resolved = resolveDisUI(message);
    const containerChildren = getContainerChildren(resolved);

    expect(containerChildren.map((component) => getRowChildren(component)[0])).toMatchObject([
      { custom_id: 'settings-click-me' },
      { url: 'https://example.com' },
      { custom_id: 'settings-pick-size' },
      { custom_id: 'settings-pick-user' },
      { custom_id: 'settings-pick-role' },
      { custom_id: 'settings-pick-mentionable' },
      { custom_id: 'settings-pick-channel' },
    ]);

    const linkButton = getRowChildren(containerChildren[1])[0];
    expect('custom_id' in linkButton ? linkButton.custom_id : undefined).toBeUndefined();
  });

  it('renders entity selects and file', () => {
    const message = ui(
      container(
        row(userSelect('pick-user').placeholder('Pick a user').min(1).max(3).default('214858075650260992')),
        row(roleSelect('pick-role').default('1', '2')),
        row(mentionableSelect('pick-mentionable').placeholder('Pick').default('user', TEST_IDS.user)),
        row(
          channelSelect('pick-channel')
            .placeholder('Pick a channel')
            .types([ChannelType.GuildText, ChannelType.GuildVoice]),
        ),
        file(TEST_URLS.file).spoiler(),
      ),
    );

    const resolved = resolveDisUI(message);
    const containerChildren = getContainerChildren(resolved);

    const userSelectComponent = getRowChildren(containerChildren[0])[0];
    if (userSelectComponent.type !== ComponentType.UserSelect) {
      throw new Error('Expected a user select');
    }

    expect(userSelectComponent).toMatchObject({
      placeholder: 'Pick a user',
      min_values: 1,
      max_values: 3,
      default_values: [{ id: TEST_IDS.user }],
    });

    const roleSelectComponent = getRowChildren(containerChildren[1])[0];
    if (roleSelectComponent.type !== ComponentType.RoleSelect) {
      throw new Error('Expected a role select');
    }

    expect(roleSelectComponent.default_values?.map((value) => value.id)).toEqual(['1', '2']);

    const mentionableSelectComponent = getRowChildren(containerChildren[2])[0];
    if (mentionableSelectComponent.type !== ComponentType.MentionableSelect) {
      throw new Error('Expected a mentionable select');
    }

    expect(mentionableSelectComponent).toMatchObject({
      placeholder: 'Pick',
      default_values: [{ id: TEST_IDS.user }],
    });

    const channelSelectComponent = getRowChildren(containerChildren[3])[0];
    if (channelSelectComponent.type !== ComponentType.ChannelSelect) {
      throw new Error('Expected a channel select');
    }

    expect(channelSelectComponent).toMatchObject({
      placeholder: 'Pick a channel',
      channel_types: [ChannelType.GuildText, ChannelType.GuildVoice],
    });

    const fileComponent = containerChildren[4];
    if (fileComponent.type !== ComponentType.File) {
      throw new Error('Expected a file component');
    }

    expect(fileComponent).toMatchObject({
      file: { url: TEST_URLS.file },
      spoiler: true,
    });
  });

  it('resolves non-ui components as top-level payloads', () => {
    const resolved = resolveDisUI(container(text('Standalone content')));
    const containerChildren = getContainerChildren(resolved);

    expect(resolved.flags).toBe(MessageFlags.IsComponentsV2);
    expect(resolved.allowed_mentions).toEqual({
      parse: [AllowedMentionsTypes.User],
    });
    expect(containerChildren).toMatchObject([{ content: 'Standalone content' }]);
  });

  it('flattens fragments inside containers and rows', () => {
    const resolved = resolveDisUI(
      ui(
        container(
          fragment(null, text('First')),
          row(fragment(null, button('Primary', 'first'), fragment(null, button('Secondary', 'second')))),
        ),
      ),
    );

    const containerChildren = getContainerChildren(resolved);
    const buttonChildren = getRowChildren(containerChildren[1]);

    expect(containerChildren[0]).toMatchObject({
      type: ComponentType.TextDisplay,
      content: 'First',
    });
    expect(buttonChildren.map((button) => ('custom_id' in button ? button.custom_id : undefined))).toEqual([
      'first',
      'second',
    ]);
  });
});
