/** biome-ignore-all lint/style/noNonNullAssertion: Test narrowing */
import { ChannelType, ComponentType, SelectMenuDefaultValueType } from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import { channelSelect, container, mentionableSelect, roleSelect, row, userSelect } from '../components';
import { resolveDisUI } from '../core';
import { getContainerChildren, getRowChildren, TEST_IDS } from './helpers';

describe('entity selects', () => {
  it('renders user select defaults and disabled override', () => {
    const resolved = resolveDisUI(
      container(row(userSelect('users').placeholder('Pick users').min(1).max(2).default(TEST_IDS.user)).disabled()),
    );
    const selectComponent = getRowChildren(getContainerChildren(resolved)[0])[0];

    if (selectComponent.type !== ComponentType.UserSelect) {
      throw new Error('Expected a user select');
    }

    expect(selectComponent).toMatchObject({
      custom_id: 'users',
      placeholder: 'Pick users',
      min_values: 1,
      max_values: 2,
      disabled: true,
      default_values: [{ id: TEST_IDS.user, type: SelectMenuDefaultValueType.User }],
    });
  });

  it('renders role select defaults and explicit enabled state', () => {
    const resolved = resolveDisUI(
      container(
        row(
          roleSelect('roles').placeholder('Pick roles').min(0).max(5).default(TEST_IDS.role, TEST_IDS.roleAlt),
        ).disabled(),
      ),
    );
    const selectComponent = getRowChildren(getContainerChildren(resolved)[0])[0];

    if (selectComponent.type !== ComponentType.RoleSelect) {
      throw new Error('Expected a role select');
    }

    expect(selectComponent.placeholder).toBe('Pick roles');
    expect(selectComponent.min_values).toBe(0);
    expect(selectComponent.max_values).toBe(5);
    expect(selectComponent.disabled).toBe(true);
    expect(selectComponent.default_values).toEqual([
      { id: TEST_IDS.role, type: SelectMenuDefaultValueType.Role },
      { id: TEST_IDS.roleAlt, type: SelectMenuDefaultValueType.Role },
    ]);
  });

  it('renders mentionable select role defaults', () => {
    const resolved = resolveDisUI(
      container(
        row(mentionableSelect('mentions').placeholder('Pick mentions').min(1).max(4).default('role', TEST_IDS.role)),
      ),
    );
    const selectComponent = getRowChildren(getContainerChildren(resolved)[0])[0];

    if (selectComponent.type !== ComponentType.MentionableSelect) {
      throw new Error('Expected a mentionable select');
    }

    expect(selectComponent).toMatchObject({
      custom_id: 'mentions',
      placeholder: 'Pick mentions',
      min_values: 1,
      max_values: 4,
      default_values: [{ id: TEST_IDS.role, type: SelectMenuDefaultValueType.Role }],
    });
  });

  it('renders channel select defaults and channel type filters', () => {
    const resolved = resolveDisUI(
      container(
        row(
          channelSelect('channels')
            .placeholder('Pick channels')
            .min(1)
            .max(3)
            .default(TEST_IDS.channel, TEST_IDS.channelAlt)
            .types([ChannelType.GuildText, ChannelType.GuildAnnouncement]),
        ),
      ),
    );
    const selectComponent = getRowChildren(getContainerChildren(resolved)[0])[0];

    if (selectComponent.type !== ComponentType.ChannelSelect) {
      throw new Error('Expected a channel select');
    }

    expect(selectComponent).toMatchObject({
      custom_id: 'channels',
      placeholder: 'Pick channels',
      min_values: 1,
      max_values: 3,
      channel_types: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
      default_values: [
        { id: TEST_IDS.channel, type: SelectMenuDefaultValueType.Channel },
        { id: TEST_IDS.channelAlt, type: SelectMenuDefaultValueType.Channel },
      ],
    });
  });

  it('omits entity select defaults when none are configured', () => {
    const resolved = resolveDisUI(
      container(
        row(userSelect('users')),
        row(roleSelect('roles')),
        row(mentionableSelect('mentions')),
        row(channelSelect('channels')),
      ),
    );
    const [userComponent] = getRowChildren(getContainerChildren(resolved)[0]);
    const [roleComponent] = getRowChildren(getContainerChildren(resolved)[1]);
    const [mentionableComponent] = getRowChildren(getContainerChildren(resolved)[2]);
    const [channelComponent] = getRowChildren(getContainerChildren(resolved)[3]);

    expect(userComponent.type).toBe(ComponentType.UserSelect);
    expect(roleComponent.type).toBe(ComponentType.RoleSelect);
    expect(mentionableComponent.type).toBe(ComponentType.MentionableSelect);
    expect(channelComponent.type).toBe(ComponentType.ChannelSelect);
    expect(
      [userComponent, roleComponent, mentionableComponent, channelComponent].every(
        (component) => !('default_values' in component) || component.default_values === undefined,
      ),
    ).toBe(true);
  });
});
