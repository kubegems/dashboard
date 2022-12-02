import { V1ObjectMeta } from '@kubernetes/client-node/dist/gen/model/v1ObjectMeta';

export function initKModel<T>(
  attributes: {
    name: string;
    baseName: string;
    type: string;
  }[],
): T {
  const data = {};
  attributes.forEach((attribute) => {
    if (attribute.type === 'string') data[attribute.name] = '';
    else if (attribute.type === 'number') data[attribute.name] = 0;
    else if (attribute.type === '{ [key: string]: string; }') data[attribute.name] = {};
    else if (attribute.type === 'Date') data[attribute.name] = new Date();
    else if (attribute.type === 'boolean') data[attribute.name] = false;
    else if (attribute.type.startsWith('Array')) data[attribute.name] = [];
    else data[attribute.name] = {};
  });
  return data as T;
}

export class Metadata extends V1ObjectMeta {
  constructor() {
    super();
    const data = initKModel<V1ObjectMeta>(V1ObjectMeta.attributeTypeMap);
    Object.assign(this, data);
  }
}
