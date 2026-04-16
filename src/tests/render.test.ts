import {
  AllowedMentionsTypes,
  type APIMessageComponent,
  ChannelType,
  ComponentType,
  MessageFlags,
} from 'discord-api-types/v10';
import { describe, expect, it } from 'vitest';
import {
  button,
  channelSelect,
  container,
  divider,
  file,
  gallery,
  image,
  mentionableSelect,
  roleSelect,
  row,
  section,
  select,
  text,
  userSelect,
} from '../components';
import { ui } from '../components/ui';
import { resolveDisUI } from '../core';
import { emoji } from '../structures';

function getContainerChildren(component: APIMessageComponent) {
  if (component.type !== ComponentType.Container) {
    throw new Error('Expected a container component');
  }

  return component.components;
}

function getRowChildren(component: APIMessageComponent) {
  if (component.type !== ComponentType.ActionRow) {
    throw new Error('Expected an action row');
  }

  return component.components;
}

function getGalleryItems(component: APIMessageComponent) {
  if (component.type !== ComponentType.MediaGallery) {
    throw new Error('Expected a media gallery');
  }

  return component.items;
}

function getSectionAccessory(component: APIMessageComponent) {
  if (component.type !== ComponentType.Section) {
    throw new Error('Expected a section');
  }

  return component.accessory;
}

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

    const containerChildren = getContainerChildren(resolved.components[0]);
    const buttonChildren = getRowChildren(containerChildren[2]);

    expect(buttonChildren).toMatchObject([
      { custom_id: 'click-me', disabled: false },
      { custom_id: 'like-button', disabled: true, emoji: { name: '👍', id: null } },
    ]);
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
    const containerChildren = getContainerChildren(resolved.components[0]);

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
        row(mentionableSelect('pick-mentionable').placeholder('Pick').default('user', '214858075650260992')),
        row(
          channelSelect('pick-channel')
            .placeholder('Pick a channel')
            .types([ChannelType.GuildText, ChannelType.GuildVoice]),
        ),
        file('attachment://example.txt').spoiler(),
      ),
    );

    const resolved = resolveDisUI(message);
    const containerChildren = getContainerChildren(resolved.components[0]);

    const userSelectComponent = getRowChildren(containerChildren[0])[0];
    if (userSelectComponent.type !== ComponentType.UserSelect) {
      throw new Error('Expected a user select');
    }

    expect(userSelectComponent).toMatchObject({
      placeholder: 'Pick a user',
      min_values: 1,
      max_values: 3,
      default_values: [{ id: '214858075650260992' }],
    });

    const roleSelectComponent = getRowChildren(containerChildren[1])[0];
    if (roleSelectComponent.type !== ComponentType.RoleSelect) {
      throw new Error('Expected a role select');
    }

    expect(roleSelectComponent.default_values.map((value) => value.id)).toEqual(['1', '2']);

    const mentionableSelectComponent = getRowChildren(containerChildren[2])[0];
    if (mentionableSelectComponent.type !== ComponentType.MentionableSelect) {
      throw new Error('Expected a mentionable select');
    }

    expect(mentionableSelectComponent).toMatchObject({
      placeholder: 'Pick',
      default_values: [{ id: '214858075650260992' }],
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
      file: { url: 'attachment://example.txt' },
      spoiler: true,
    });
    expect(resolved.attachments).toEqual([]);
    expect(resolved.files).toEqual([]);
  });

  it('collects multipart files and rewrites attachment urls', () => {
    const reportFile = {
      name: 'report.txt',
      data: Buffer.from('report'),
      contentType: 'text/plain',
    };
    const sectionImage = {
      name: 'thumbnail.png',
      data: Buffer.from('thumbnail'),
      contentType: 'image/png',
    };
    const galleryImage = {
      name: 'gallery.png',
      data: Buffer.from('gallery'),
      contentType: 'image/png',
      key: 'files[9]',
    };
    const message = ui(
      container(
        file(reportFile).spoiler(),
        section(text('Preview'), image(sectionImage).alt('Section image')),
        gallery(image(galleryImage).alt('Gallery image').spoiler()),
      ),
    );

    const resolved = resolveDisUI(message);
    const containerChildren = getContainerChildren(resolved.components[0]);

    const multipartFileComponent = containerChildren[0];
    if (multipartFileComponent.type !== ComponentType.File) {
      throw new Error('Expected a file component');
    }

    expect(multipartFileComponent).toMatchObject({
      file: { url: 'attachment://report.txt' },
      spoiler: true,
    });

    const sectionAccessory = getSectionAccessory(containerChildren[1]);
    if (sectionAccessory.type !== ComponentType.Thumbnail) {
      throw new Error('Expected a thumbnail accessory');
    }

    expect(sectionAccessory).toMatchObject({
      media: { url: 'attachment://thumbnail.png' },
      description: 'Section image',
    });

    expect(getGalleryItems(containerChildren[2])).toMatchObject([
      {
        media: { url: 'attachment://gallery.png' },
        description: 'Gallery image',
        spoiler: true,
      },
    ]);

    expect(resolved.attachments).toEqual([
      { id: 0, filename: 'report.txt' },
      { id: 1, filename: 'thumbnail.png' },
      { id: 2, filename: 'gallery.png' },
    ]);
    expect(resolved.files).toEqual([
      {
        ...reportFile,
        key: 'files[0]',
      },
      {
        ...sectionImage,
        key: 'files[1]',
      },
      {
        ...galleryImage,
      },
    ]);
  });
});
