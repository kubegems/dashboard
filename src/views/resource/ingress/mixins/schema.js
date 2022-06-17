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
            default: 'networking.k8s.io/v1',
          },
          kind: {
            $id: '#/properties/kind',
            type: 'string',
            default: '',
            const: 'Ingress',
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
            required: ['rules'],
            properties: {
              ingressClassName: {
                $id: '#/properties/spec/properties/ingressClassName',
                type: 'string',
                default: '',
              },
              tls: {
                $id: '#/properties/spec/properties/tls',
                type: 'array',
                default: [],
                items: {
                  $id: '#/properties/spec/properties/tls/items',
                },
              },
              rules: {
                $id: '#/properties/spec/properties/rules',
                type: 'array',
                default: [],
                items: {
                  $id: '#/properties/spec/properties/rules/items',
                },
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
