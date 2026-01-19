import {
  AsyncChannelObject,
  AsyncOperationObject,
} from './asyncapi-common.interfaces';

export interface DenormalizedDoc {
  root?: { name: string } & AsyncChannelObject;
  operations?: {
    pub?: AsyncOperationObject;
    sub?: AsyncOperationObject;
  };
}
