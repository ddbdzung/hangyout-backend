export interface IMetadataQueryResponse {
  _id: string;
  _index: string;
  _score: number;
  _source: Record<string, any>;
}
