import { type APISelectMenuDefaultValue, type ChannelType, SelectMenuDefaultValueType } from 'discord-api-types/v10';
import { type ComponentBase, constructComponent } from '../internal';

export interface ChannelSelectComponent
  extends ComponentBase<
    'ChannelSelect',
    {
      placeholder: string | undefined;
      disabled: boolean | undefined;
      min_values: number | undefined;
      max_values: number | undefined;
      default_values: APISelectMenuDefaultValue<SelectMenuDefaultValueType.Channel>[] | undefined;
      channel_types: ChannelType[] | undefined;
    }
  > {
  placeholder: (placeholder: string) => this;
  disabled: (condition?: boolean) => this;
  min: (minValues: number) => this;
  max: (maxValues: number) => this;
  addDefault: (id: string) => this;
  setDefaults: (ids: string[]) => this;
  types: (types: ChannelType[]) => this;
}

export function channelSelect(id: string): ChannelSelectComponent {
  let placeholderVar: string | undefined;
  let disabledVar: boolean | undefined;
  let minValuesVar: number | undefined;
  let maxValuesVar: number | undefined;
  let defaultValuesVar: APISelectMenuDefaultValue<SelectMenuDefaultValueType.Channel>[] = [];
  let channelTypesVar: ChannelType[] | undefined;

  const output = {
    ...constructComponent('ChannelSelect', ({ context }) => ({
      placeholder: placeholderVar,
      disabled: disabledVar ?? !!context.disabled,
      min_values: minValuesVar,
      max_values: maxValuesVar,
      default_values: defaultValuesVar.length > 0 ? defaultValuesVar : undefined,
      channel_types: channelTypesVar,
      custom_id: `${context.id ? `${context.id}-` : id}`,
    })),

    placeholder: (placeholder: string) => {
      placeholderVar = placeholder;

      return output;
    },

    disabled: (condition = true) => {
      disabledVar = condition;

      return output;
    },

    min: (minValues: number) => {
      minValuesVar = minValues;

      return output;
    },

    max: (maxValues: number) => {
      maxValuesVar = maxValues;

      return output;
    },

    addDefault: (channelId: string) => {
      defaultValuesVar.push({ id: channelId, type: SelectMenuDefaultValueType.Channel });

      return output;
    },

    setDefaults: (ids: string[]) => {
      defaultValuesVar = ids.map((channelId) => ({ id: channelId, type: SelectMenuDefaultValueType.Channel }));

      return output;
    },

    types: (types: ChannelType[]) => {
      channelTypesVar = types;

      return output;
    },
  };

  return output;
}
