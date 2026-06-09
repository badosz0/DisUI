import { TextInputStyle } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent } from '../internal';

export interface InputComponent
  extends ComponentBase<
    'Input',
    {
      custom_id: string;
      style: TextInputStyle;
      min_length: number | undefined;
      max_length: number | undefined;
      required: boolean | undefined;
      value: string | undefined;
      placeholder: string | undefined;
    }
  > {
  style: (style: 'short' | 'paragraph') => this;
  required: (condition?: boolean) => this;
  min: (minLength: number) => this;
  max: (maxLength: number) => this;
  value: (value: string | undefined) => this;
  placeholder: (placeholder: string | undefined) => this;
}

export function input(id: string): InputComponent {
  let styleVar: TextInputStyle = TextInputStyle.Short;
  let requiredVar: boolean | undefined;
  let minLengthVar: number | undefined;
  let maxLengthVar: number | undefined;
  let valueVar: string | undefined;
  let placeholderVar: string | undefined;

  const output = {
    ...constructComponent('Input', ({ context }) => ({
      custom_id: `${context.id ? `${context.id}-` : ''}${id}`,
      style: styleVar,
      min_length: minLengthVar,
      max_length: maxLengthVar,
      required: requiredVar,
      value: valueVar,
      placeholder: placeholderVar,
    })),

    style: (style: 'short' | 'paragraph') => {
      styleVar = {
        short: TextInputStyle.Short,
        paragraph: TextInputStyle.Paragraph,
      }[style];

      return output;
    },

    required: (condition = true) => {
      requiredVar = condition;

      return output;
    },

    min: (minLength: number) => {
      minLengthVar = minLength;

      return output;
    },

    max: (maxLength: number) => {
      maxLengthVar = maxLength;

      return output;
    },

    value: (value: string | undefined) => {
      valueVar = value;

      return output;
    },

    placeholder: (placeholder: string | undefined) => {
      placeholderVar = placeholder;

      return output;
    },
  };

  return output;
}
