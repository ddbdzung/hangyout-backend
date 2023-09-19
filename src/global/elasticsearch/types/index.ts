type IndexName = string;
interface ErrorCauseKeys {
  type: string;
  reason?: string;
  stack_trace?: string;
  caused_by?: ErrorCause;
  root_cause?: ErrorCause[];
  suppressed?: ErrorCause[];
}
type ErrorCause = ErrorCauseKeys & {
  [property: string]: any;
};

type integer = number;
interface ShardFailure {
  index?: IndexName;
  node?: string;
  reason: ErrorCause;
  shard: integer;
  status?: string;
}

type uint = number;
interface ShardStatistics {
  failed: uint;
  successful: uint;
  total: uint;
  failures?: ShardFailure[];
  skipped?: uint;
}

type Id = string;
type long = number;
type Result = 'created' | 'updated' | 'deleted' | 'not_found' | 'noop';
type SequenceNumber = number;
type VersionNumber = number;
export interface WriteResponseBase {
  _id: Id;
  _index: IndexName;
  _primary_term: long;
  result: Result;
  _seq_no: SequenceNumber;
  _shards: ShardStatistics;
  _version: VersionNumber;
  forced_refresh?: boolean;
}

export type DeleteResponse = WriteResponseBase;
