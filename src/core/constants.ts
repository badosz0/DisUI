export const DisUISymbol = '~internal-disui' as const;

export const DisUIComponentType = {
  UI: -2,
  Fragment: -1,
  Row: 1,
  Button: 2,
  Select: 3,
  UserSelect: 5,
  RoleSelect: 6,
  MentionableSelect: 7,
  ChannelSelect: 8,
  Section: 9,
  Text: 10,
  Thumbnail: 11,
  MediaGallery: 12,
  File: 13,
  Divider: 14,
  Container: 17,
} as const;

export type DisUIComponentTypeName = keyof typeof DisUIComponentType;

export type DisUIComponent<
  Type extends DisUIComponentTypeName = DisUIComponentTypeName,
  D extends Record<string, unknown> = Record<string, unknown>,
> = {
  [DisUISymbol]: {
    type: (typeof DisUIComponentType)[Type];
    render: (options: { stack: DisUIComponentTypeName[]; context: Record<string, unknown> }) => D;
  };
};
