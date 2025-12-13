export const DisUISymbol = '~internal' as const;

export const DisUIComponentType = {
  Fragment: -1,
  Row: 1,
  Button: 2,
  Select: 3,
  Section: 9,
  Text: 10,
  Thumbnail: 11,
  MediaGallery: 12,
  Divider: 14,
  Container: 17,
} as const;

export type DisUIComponentTypeName = keyof typeof DisUIComponentType;

export type DisUIComponent<Type extends DisUIComponentTypeName = DisUIComponentTypeName> = {
  [DisUISymbol]: {
    type: (typeof DisUIComponentType)[Type];
    render: (options: { stack: DisUIComponentTypeName[]; context: Record<string, unknown> }) => Record<string, unknown>;
  };
};
