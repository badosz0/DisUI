import { type APIPartialEmoji, ButtonStyle } from 'discord-api-types/v10';
import { constructComponent } from '../internal';
import { emoji } from '../structures';

export function button(labelOrEmoji: string | APIPartialEmoji, id: string) {
  let styleVar: ButtonStyle = ButtonStyle.Primary;
  let disabledVar: boolean | undefined;
  let emojiVar: APIPartialEmoji | undefined;

  const output = {
    ...constructComponent('Button', ({ context }) => {
      return {
        label: typeof labelOrEmoji === 'string' ? labelOrEmoji : undefined,
        style: styleVar,
        custom_id: styleVar !== ButtonStyle.Link ? `${context.id ? `${context.id}-` : id}` : undefined,
        url: styleVar === ButtonStyle.Link ? id.trim() : undefined,
        disabled: disabledVar ?? context.disabled,
        emoji: typeof labelOrEmoji !== 'string' ? labelOrEmoji : emojiVar,
      };
    }),

    style: (style: 'primary' | 'secondary' | 'success' | 'danger' | 'link') => {
      styleVar = {
        primary: ButtonStyle.Primary,
        secondary: ButtonStyle.Secondary,
        success: ButtonStyle.Success,
        danger: ButtonStyle.Danger,
        link: ButtonStyle.Link,
      }[style];

      return output;
    },

    disabled: (condition = true) => {
      disabledVar = condition;
      return output;
    },

    emoji: (input: string | APIPartialEmoji) => {
      emojiVar = emoji(input);
      return output;
    },
  };

  return output;
}
