import { Optional } from './optional';

export class Document {
  private filetype: DocumentType;
  private data: string;
  constructor(filetype: DocumentType, data: string) {
    this.filetype = filetype;
    this.data = data;
  }

  public getFiletype(): DocumentType {
    return this.filetype;
  }

  public getData(): string {
    return this.data;
  }

  public getDocumentHash(): Optional<string> {
    switch (this.filetype) {
      case DocumentType.hash:
        return Optional.Some(this.data);
      default:
        return Optional.None();
    }
  }
}

enum DocumentType {
  hash = 'hash',
  json = 'json',
  pdf = 'pdf',
  xml = 'xml',
}
