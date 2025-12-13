import type { APIPartialEmoji } from 'discord-api-types/v10';

const discordEmojiRegex = /^<(?<animated>a?):(?<name>.*):(?<id>\d{18,22})>$/;
const nativeEmojiRegex = /\p{Extended_Pictographic}$/u;

export function emoji(input: string | APIPartialEmoji) {
  const name: APIPartialEmoji['name'] = typeof input === 'string' ? input : input.name;
  const id: APIPartialEmoji['id'] = typeof input === 'string' ? null : input.id;
  const animated: APIPartialEmoji['animated'] = typeof input === 'string' ? false : (input.animated ?? false);
  const native = typeof input === 'string';

  const output = {
    id,
    name,
    animated,
    toString: () => (native ? name : `<${animated ? 'a:' : ':'}${name}:${id}>`),
    url: () =>
      native
        ? `https://twemoji.maxcdn.com/v/latest/72x72/${name?.codePointAt(0)?.toString(16)}.png`
        : `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`,
  };

  return output;
}
