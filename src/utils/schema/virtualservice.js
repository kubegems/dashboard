const schema = {
  $schema: 'http://json-schema.org/draft-07/schema',
  $id: 'http://example.com/example.json',
  type: 'object',
  default: {},
  required: ['apiVersion', 'kind', 'metadata', 'spec'],
  properties: {
    apiVersion: {
      $id: '#/properties/apiVersion',
      type: 'string',
      default: '',
      enum: ['networking.istio.io/v1beta1', 'networking.istio.io/v1alpha3'],
    },
    kind: {
      $id: '#/properties/kind',
      type: 'string',
      default: '',
      const: 'VirtualService',
    },
    metadata: {
      $id: '#/properties/metadata',
      type: 'object',
      default: {},
      required: ['name'],
      properties: {
        name: {
          $id: '#/properties/metadata/properties/name',
          type: 'string',
          default: '',
        },
      },
      additionalProperties: true,
    },
    spec: {
      $id: '#/properties/spec',
      type: 'object',
      default: {},
      required: ['hosts'],
      properties: {
        hosts: {
          $id: '#/properties/spec/properties/hosts',
          type: 'array',
          default: [],
          items: {
            $id: '#/properties/spec/properties/hosts/items',
          },
        },
        gateways: {
          $id: '#/properties/spec/properties/gateways',
          type: 'array',
          default: [],
          items: {
            $id: '#/properties/spec/properties/gateways/items',
          },
        },
        http: {
          $id: '#/properties/spec/properties/http',
          type: 'array',
          default: [],
          items: {
            $id: '#/properties/spec/properties/http/items',
            anyOf: [
              {
                $id: '#/properties/spec/properties/http/items/anyOf/0',
                type: 'object',
                default: {},
                properties: {
                  match: {
                    $id: '#/properties/spec/properties/http/items/anyOf/0/properties/match',
                    type: 'array',
                    default: [],
                    items: {
                      $id: '#/properties/spec/properties/http/items/anyOf/0/properties/match/items',
                    },
                  },
                  route: {
                    $id: '#/properties/spec/properties/http/items/anyOf/0/properties/route',
                    type: 'array',
                    default: [],
                    items: {
                      $id: '#/properties/spec/properties/http/items/anyOf/0/properties/route/items',
                    },
                  },
                },
                additionalProperties: true,
              },
            ],
          },
        },
        tcp: {
          $id: '#/properties/spec/properties/tcp',
          type: 'array',
          default: [],
          items: {
            $id: '#/properties/spec/properties/tcp/items',
            anyOf: [
              {
                $id: '#/properties/spec/properties/tcp/items/anyOf/0',
                type: 'object',
                default: {},
                properties: {
                  match: {
                    $id: '#/properties/spec/properties/tcp/items/anyOf/0/properties/match',
                    type: 'array',
                    default: [],
                    items: {
                      $id: '#/properties/spec/properties/tcp/items/anyOf/0/properties/match/items',
                    },
                  },
                  route: {
                    $id: '#/properties/spec/properties/tcp/items/anyOf/0/properties/route',
                    type: 'array',
                    default: [],
                    items: {
                      $id: '#/properties/spec/properties/tcp/items/anyOf/0/properties/route/items',
                    },
                  },
                },
                additionalProperties: true,
              },
            ],
          },
        },
        tls: {
          $id: '#/properties/spec/properties/tls',
          type: 'array',
          default: [],
          items: {
            $id: '#/properties/spec/properties/tls/items',
            anyOf: [
              {
                $id: '#/properties/spec/properties/tls/items/anyOf/0',
                type: 'object',
                default: {},
                properties: {
                  match: {
                    $id: '#/properties/spec/properties/tls/items/anyOf/0/properties/match',
                    type: 'array',
                    default: [],
                    items: {
                      $id: '#/properties/spec/properties/tls/items/anyOf/0/properties/match/items',
                    },
                  },
                  route: {
                    $id: '#/properties/spec/properties/tls/items/anyOf/0/properties/route',
                    type: 'array',
                    default: [],
                    items: {
                      $id: '#/properties/spec/properties/tls/items/anyOf/0/properties/route/items',
                    },
                  },
                },
                additionalProperties: true,
              },
            ],
          },
        },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

export default schema;
