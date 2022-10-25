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
      const: 'DestinationRule',
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
      required: ['host'],
      properties: {
        host: {
          $id: '#/properties/spec/properties/host',
          type: 'string',
          default: '',
        },
        trafficPolicy: {
          $id: '#/properties/spec/properties/trafficPolicy',
          type: 'object',
          default: {},
          required: [],
          additionalProperties: true,
        },
        subsets: {
          $id: '#/properties/spec/properties/subsets',
          type: 'array',
          default: [],
          items: {
            $id: '#/properties/spec/properties/subsets/items',
            anyOf: [
              {
                $id: '#/properties/spec/properties/subsets/items/anyOf/0',
                type: 'object',
                default: {},
                required: ['name'],
                properties: {
                  name: {
                    $id: '#/properties/spec/properties/subsets/items/anyOf/0/properties/name',
                    type: 'string',
                    default: '',
                  },
                  labels: {
                    $id: '#/properties/spec/properties/subsets/items/anyOf/0/properties/labels',
                    type: 'object',
                    default: {},
                    required: [],
                    additionalProperties: true,
                  },
                  trafficPolicy: {
                    $id: '#/properties/spec/properties/subsets/items/anyOf/0/properties/trafficPolicy',
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
        exportTo: {
          $id: '#/properties/spec/properties/exportTo',
          type: 'array',
          default: [],
          items: {
            $id: '#/properties/spec/properties/exportTo/items',
          },
        },
      },
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

export default schema;
