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
            const: `gems.kubegems.io/v1beta1`,
          },
          kind: {
            $id: '#/properties/kind',
            type: 'string',
            default: '',
            const: 'TenantGateway',
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
            required: ['tenant', 'type', 'replicas', 'baseDomain'],
            properties: {
              tenant: {
                $id: '#/properties/spec/properties/tenant',
                type: 'string',
                default: '',
              },
              type: {
                $id: '#/properties/spec/properties/type',
                type: 'string',
                default: '',
              },
              replicas: {
                $id: '#/properties/spec/properties/replicas',
                type: 'integer',
                default: 0,
              },
              baseDomain: {
                $id: '#/properties/spec/properties/baseDomain',
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
