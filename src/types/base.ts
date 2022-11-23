import { V1ObjectMeta } from '@kubernetes/client-node/dist/gen/model/v1ObjectMeta';

declare global {
  type KubeRequest = {
    [params: string]: any;
  };

  type KubeResponse<T, U> = {
    Data: T;
    Message: string;
    ErrorData: U;

    data: T;
    message: string;
  };

  type KubePaginationRequest = {
    size: number;
    page: number;
    [params: string]: any;
  };

  type KubePaginationResponse<T> = {
    List: T;
    CurrentPage: number;
    CurrentSize: number;
    Total: number;

    list: T;
    page: number;
    size: number;
    total: number;
  };

  type Pagination<T> = {
    items: T[];
    size: number;
    pageCount: number;
    page: number;
  };
}

export class Metadata extends V1ObjectMeta {
  constructor() {
    super();
    const data = {};
    V1ObjectMeta.attributeTypeMap.forEach((attribute) => {
      if (attribute.type === 'string') data[attribute.name] = '';
      else if (attribute.type === 'number') data[attribute.name] = 0;
      else if (attribute.type === '{ [key: string]: string; }') data[attribute.name] = {};
      else if (attribute.type === 'Date') data[attribute.name] = new Date();
      else if (attribute.type === 'string') data[attribute.name] = '';
      else if (attribute.type.startsWith('Array')) data[attribute.name] = [];
      else data[attribute.name] = {};
    });
    Object.assign(this, data);
  }
}

export {};
