/** biome-ignore-all lint/style/noNonNullAssertion: This is a valid regex */
import type { APIPartialEmoji } from 'discord-api-types/v10';

const discordEmojiRegex = /^<(?<animated>a?):(?<name>.*):(?<id>\d{18,22})>$/;
const nativeEmojiRegex = /\p{Extended_Pictographic}$/u;

export function emoji(input: string | APIPartialEmoji) {
  if (typeof input === 'string') {
    const discordEmojiMatch = input.match(discordEmojiRegex);
    const isNativeEmoji = nativeEmojiRegex.test(input);

    if (!discordEmojiMatch && !isNativeEmoji) {
      throw new Error(`Invalid emoji: ${input}`);
    }

    const { id, name, animated } = discordEmojiMatch?.groups ?? {};

    if (discordEmojiMatch) {
      return {
        id,
        name,
        animated: !!animated,
        toString: () => `<${animated === 'a' ? 'a:' : ':'}${name}:${id}>`,
        url: () => `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`,
      };
    }

    return {
      name: input,
      id: null,
      toString: () => input,
      url: () => `https://twemoji.maxcdn.com/v/latest/72x72/${input.codePointAt(0)?.toString(16)}.png`,
    };
  }

  const output = {
    id: input.id,
    name: input.name,
    animated: input.animated,
    toString: () => `<${input.animated ? 'a:' : ':'}${input.name}:${input.id}>`,
    url: () => `https://cdn.discordapp.com/emojis/${input.id}.${input.animated ? 'gif' : 'png'}`,
  };

  return output;
}
