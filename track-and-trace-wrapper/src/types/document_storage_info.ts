class DocumentStorageInfo {
  documentId: string;
  constructor(documentId: string) {
    this.documentId = documentId;
  }
  public getDocumentId(): string {
    return this.documentId;
  }
}
