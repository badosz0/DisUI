import { DisUIComponentType, DisUISymbol } from '../core/constants';
import { type ComponentBase, constructComponent } from '../internal';
import { isDisUIComponent } from '../util';

export interface TextComponent extends ComponentBase<'Text', { content: string }> {
  toString: () => string;
  bold: (condition?: boolean) => this;
  quote: (condition?: boolean) => this;
  italic: (condition?: boolean) => this;
  underline: (condition?: boolean) => this;
  monospace: (spacing?: number, condition?: boolean) => this;
  strikethrough: (condition?: boolean) => this;
  join: (joiner: string) => this;
  list: (ordered?: boolean) => this;
}

// biome-ignore lint/suspicious/noExplicitAny: This allows literally anything.
export function text(...content: any[]): TextComponent {
  let renderVar: string[] = content.filter(Boolean).map((part) => {
    if (isDisUIComponent(part) && part[DisUISymbol].type === DisUIComponentType.Text) {
      return part[DisUISymbol].render({ stack: [], context: {} }).content;
    }

    return part.toString();
  });

  const output = {
    ...constructComponent('Text', () => ({
      content: renderVar.join('\n'),
    })),

    toString: () => renderVar.join(''),

    bold: (condition = true) => {
      if (condition) {
        renderVar = renderVar.map((text) => `**${text}**`);
      }

      return output;
    },

    quote: (condition = true) => {
      if (condition) {
        renderVar = renderVar.map((text) => `> ${text}`);
      }

      return output;
    },

    italic: (condition = true) => {
      if (condition) {
        renderVar = renderVar.map((text) => `*${text}*`);
      }

      return output;
    },

    underline: (condition = true) => {
      if (condition) {
        renderVar = renderVar.map((text) => `__${text}__`);
      }

      return output;
    },

    monospace: (spacing = 0, condition = true) => {
      if (condition) {
        renderVar = renderVar.map((text) => `\`${' '.repeat(spacing)}${text}${' '.repeat(spacing)}\``);
      }

      return output;
    },

    strikethrough: (condition = true) => {
      if (condition) {
        renderVar = renderVar.map((text) => `~~${text}~~`);
      }

      return output;
    },

    join: (joiner: string) => {
      renderVar = [renderVar.join(joiner)];
      return output;
    },

    list: (ordered = false) => {
      renderVar = [renderVar.map((text, i) => (ordered ? `${i + 1}. ${text}` : `- ${text}`)).join('\n')];
      return output;
    },

    codeblock: (language?: string) => {
      renderVar = [renderVar.map((text) => `\`\`\`${language ?? ''}\n${text}\n\`\`\``).join('\n')];
      return output;
    },

    size: (size: 'h1' | 'h2' | 'h3' | 'sub' | 'regular' = 'regular') => {
      renderVar = renderVar.map(
        (text) =>
          ({
            h1: text ? `# ${text}` : '',
            h2: text ? `## ${text}` : '',
            h3: text ? `### ${text}` : '',
            sub: text ? `-# ${text}` : '',
            regular: text,
          })[size],
      );

      return output;
    },

    link: (url: string) => {
      renderVar = renderVar.map((text) => `[${text}](${url})`);

      return output;
    },

    spoiler: (condition = true) => {
      if (condition) {
        renderVar = renderVar.map((text) => `||${text}||`);
      }

      return output;
    },
  };

  return output;
}
