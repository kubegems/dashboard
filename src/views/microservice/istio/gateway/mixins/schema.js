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
            enum: ['networking.istio.io/v1beta1', 'networking.istio.io/v1alpha3'],
          },
          kind: {
            $id: '#/properties/kind',
            type: 'string',
            default: '',
            const: 'Gateway',
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
            required: ['selector', 'servers'],
            properties: {
              selector: {
                $id: '#/properties/spec/properties/selector',
                type: 'object',
                default: {},
                required: [],
                additionalProperties: true,
              },
              servers: {
                $id: '#/properties/spec/properties/servers',
                type: 'array',
                default: [],
                items: {
                  $id: '#/properties/spec/properties/servers/items',
                  anyOf: [
                    {
                      $id: '#/properties/spec/properties/servers/items/anyOf/0',
                      type: 'object',
                      default: {},
                      required: ['port', 'hosts'],
                      properties: {
                        port: {
                          $id: '#/properties/spec/properties/servers/items/anyOf/0/properties/port',
                          type: 'object',
                          default: {},
                          required: ['number', 'name', 'protocol'],
                          properties: {
                            number: {
                              $id: '#/properties/spec/properties/servers/items/anyOf/0/properties/port/properties/number',
                              type: 'integer',
                              default: 0,
                            },
                            name: {
                              $id: '#/properties/spec/properties/servers/items/anyOf/0/properties/port/properties/name',
                              type: 'string',
                              default: '',
                            },
                            protocol: {
                              $id: '#/properties/spec/properties/servers/items/anyOf/0/properties/port/properties/protocol',
                              type: 'string',
                              default: '',
                            },
                          },
                          additionalProperties: true,
                        },
                        hosts: {
                          $id: '#/properties/spec/properties/servers/items/anyOf/0/properties/hosts',
                          type: 'array',
                          default: [],
                          items: {
                            $id: '#/properties/spec/properties/servers/items/anyOf/0/properties/hosts/items',
                            anyOf: [
                              {
                                $id: '#/properties/spec/properties/servers/items/anyOf/0/properties/hosts/items/anyOf/0',
                                type: 'string',
                                default: '',
                              },
                            ],
                          },
                        },
                        tls: {
                          $id: '#/properties/spec/properties/servers/items/anyOf/0/properties/tls',
                          type: 'object',
                          default: {},
                          required: [],
                          additionalProperties: true,
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
      },
    };
  },
};

export default schema;
