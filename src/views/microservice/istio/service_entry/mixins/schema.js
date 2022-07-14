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
            const: 'networking.istio.io/v1beta1',
          },
          kind: {
            $id: '#/properties/kind',
            type: 'string',
            default: '',
            const: 'ServiceEntry',
          },
          metadata: {
            $id: '#/properties/metadata',
            type: 'object',
            default: {},
            required: ['name', 'namespace'],
            properties: {
              name: {
                $id: '#/properties/metadata/properties/name',
                type: 'string',
                default: '',
              },
              namespace: {
                $id: '#/properties/metadata/properties/namespace',
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
            required: ['hosts', 'ports', 'resolution'],
            properties: {
              hosts: {
                $id: '#/properties/spec/properties/hosts',
                type: 'array',
                default: [],
                items: {
                  $id: '#/properties/spec/properties/hosts/items',
                  anyOf: [
                    {
                      $id: '#/properties/spec/properties/hosts/items/anyOf/0',
                      type: 'string',
                      default: '',
                    },
                  ],
                },
              },
              ports: {
                $id: '#/properties/spec/properties/ports',
                type: 'array',
                default: [],
                items: {
                  $id: '#/properties/spec/properties/ports/items',
                  anyOf: [
                    {
                      $id: '#/properties/spec/properties/ports/items/anyOf/0',
                      type: 'object',
                      default: {},
                      required: ['number', 'name', 'protocol'],
                      properties: {
                        number: {
                          $id: '#/properties/spec/properties/ports/items/anyOf/0/properties/number',
                          type: 'integer',
                          default: 0,
                        },
                        name: {
                          $id: '#/properties/spec/properties/ports/items/anyOf/0/properties/name',
                          type: 'string',
                          default: '',
                        },
                        protocol: {
                          $id: '#/properties/spec/properties/ports/items/anyOf/0/properties/protocol',
                          type: 'string',
                          default: '',
                        },
                      },
                      additionalProperties: true,
                    },
                  ],
                },
              },
              resolution: {
                $id: '#/properties/spec/properties/resolution',
                type: 'string',
                default: '',
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
