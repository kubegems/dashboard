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
            const: 'Service',
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
            required: ['selector'],
            properties: {
              selector: {
                $id: '#/properties/spec/properties/selector',
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
    };
  },
};

export default schema;
