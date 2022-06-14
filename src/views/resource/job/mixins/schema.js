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
            const: 'batch/v1',
          },
          kind: {
            $id: '#/properties/kind',
            type: 'string',
            default: '',
            const: 'Job',
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
            required: ['template'],
            properties: {
              template: {
                $id: '#/properties/spec/properties/template',
                type: 'object',
                default: {},
                required: ['spec', 'metadata'],
                properties: {
                  spec: {
                    $id: '#/properties/spec/properties/template/properties/spec',
                    type: 'object',
                    default: {},
                    required: ['containers'],
                    properties: {
                      containers: {
                        $id: '#/properties/spec/properties/jobTemplate/properties/spec/properties/template/properties/spec/properties/containers',
                        type: 'array',
                        default: [],
                        items: {
                          $id: '#/properties/spec/properties/jobTemplate/properties/spec/properties/template/properties/spec/properties/containers/items',
                          anyOf: [
                            {
                              $id: '#/properties/spec/properties/jobTemplate/properties/spec/properties/template/properties/spec/properties/containers/items/anyOf/0',
                              type: 'object',
                              default: {},
                              required: ['name', 'image'],
                              properties: {
                                name: {
                                  $id: '#/properties/spec/properties/jobTemplate/properties/spec/properties/template/properties/spec/properties/containers/items/anyOf/0/properties/name',
                                  type: 'string',
                                  default: '',
                                },
                                image: {
                                  $id: '#/properties/spec/properties/jobTemplate/properties/spec/properties/template/properties/spec/properties/containers/items/anyOf/0/properties/image',
                                  type: 'string',
                                  default: '',
                                },
                              },
                              additionalProperties: true,
                            },
                          ],
                        },
                      },
                      initContainers: {
                        $id: '#/properties/spec/properties/jobTemplate/properties/spec/properties/template/properties/spec/properties/initContainers',
                        type: 'array',
                        default: [],
                        items: {
                          $id: '#/properties/spec/properties/jobTemplate/properties/spec/properties/template/properties/spec/properties/initContainers/items',
                        },
                      },
                    },
                    additionalProperties: true,
                  },
                  metadata: {
                    $id: '#/properties/spec/properties/template/properties/metadata',
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
