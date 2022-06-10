const schema = {
  data() {
    return {
      schema: {
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
            const: 'monitoring.coreos.com/v1',
          },
          kind: {
            $id: '#/properties/kind',
            type: 'string',
            default: '',
            const: 'ServiceMonitor',
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
            required: ['endpoints', 'namespaceSelector', 'selector'],
            properties: {
              endpoints: {
                $id: '#/properties/spec/properties/endpoints',
                type: 'array',
                default: [],
                items: {
                  $id: '#/properties/spec/properties/endpoints/items',
                  anyOf: [
                    {
                      $id: '#/properties/spec/properties/endpoints/items/anyOf/0',
                      type: 'object',
                      default: {},
                      oneOf: [{ required: ['port'] }, { required: ['targetPort'] }],
                      properties: {
                        port: {
                          $id: '#/properties/spec/properties/endpoints/items/anyOf/0/properties/port',
                          type: 'string',
                        },
                        scheme: {
                          $id: '#/properties/spec/properties/endpoints/items/anyOf/0/properties/scheme',
                          type: 'string',
                        },
                        honorLabels: {
                          $id: '#/properties/spec/properties/endpoints/items/anyOf/0/properties/honorLabels',
                          type: 'boolean',
                        },
                        interval: {
                          $id: '#/properties/spec/properties/endpoints/items/anyOf/0/properties/interval',
                          type: 'string',
                        },
                        targetPort: {
                          $id: '#/properties/spec/properties/endpoints/items/anyOf/0/properties/targetPort',
                          type: ['string', 'integer'],
                        },
                        scrapeTimeout: {
                          $id: '#/properties/spec/properties/endpoints/items/anyOf/0/properties/scrapeTimeout',
                          type: 'string',
                        },
                        path: {
                          $id: '#/properties/spec/properties/endpoints/items/anyOf/0/properties/path',
                          type: 'string',
                        },
                      },
                      additionalProperties: true,
                    },
                  ],
                },
              },
              namespaceSelector: {
                $id: '#/properties/spec/properties/namespaceSelector',
                type: 'object',
                default: {},
                required: ['matchNames'],
                properties: {
                  matchNames: {
                    $id: '#/properties/spec/properties/namespaceSelector/properties/matchNames',
                    type: 'array',
                    default: [],
                    items: {
                      $id: '#/properties/spec/properties/namespaceSelector/properties/matchNames/items',
                    },
                  },
                },
                additionalProperties: true,
              },
              selector: {
                $id: '#/properties/spec/properties/selector',
                type: 'object',
                default: {},
                required: ['matchLabels'],
                properties: {
                  matchLabels: {
                    $id: '#/properties/spec/properties/selector/properties/matchLabels',
                    type: 'object',
                    default: {},
                    required: [],
                    additionalProperties: true,
                  },
                },
                additionalProperties: true,
              },
            },
            additionalProperties: true,
          },
        },
        additionalProperties: true,
      },
    };
  },
};

export default schema;
