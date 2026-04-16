export interface DisUIMultipartFile {
  name: string;
  data: Buffer;
  contentType?: string;
  key?: string;
}

export interface DisUIResolvedFile extends DisUIMultipartFile {
  key: string;
}
