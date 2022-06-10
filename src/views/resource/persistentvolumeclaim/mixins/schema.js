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
            const: 'v1',
          },
          kind: {
            $id: '#/properties/kind',
            type: 'string',
            default: '',
            const: 'PersistentVolumeClaim',
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
            required: ['accessModes', 'resources', 'storageClassName'],
            properties: {
              accessModes: {
                $id: '#/properties/spec/properties/accessModes',
                type: 'array',
                default: [],
                items: {
                  $id: '#/properties/spec/properties/accessModes/items',
                },
              },
              resources: {
                $id: '#/properties/spec/properties/resources',
                type: 'object',
                default: {},
                required: ['requests'],
                properties: {
                  requests: {
                    $id: '#/properties/spec/properties/resources/properties/requests',
                    type: 'object',
                    default: {},
                    required: ['storage'],
                    properties: {
                      storage: {
                        $id: '#/properties/spec/properties/resources/properties/requests/properties/storage',
                        type: 'string',
                        default: '',
                      },
                    },
                    additionalProperties: true,
                  },
                },
                additionalProperties: true,
              },
              storageClassName: {
                $id: '#/properties/spec/properties/storageClassName',
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
