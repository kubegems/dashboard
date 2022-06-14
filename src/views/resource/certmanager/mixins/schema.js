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
            const: 'cert-manager.io/v1',
          },
          kind: {
            $id: '#/properties/kind',
            type: 'string',
            default: '',
            const: 'Certificate',
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
            required: ['secretName', 'issuerRef'],
            properties: {
              dnsNames: {
                $id: '#/properties/spec/properties/dnsNames',
                type: 'array',
                default: [],
              },
              duration: {
                $id: '#/properties/spec/properties/duration',
                type: 'string',
                default: '',
              },
              renewBefore: {
                $id: '#/properties/spec/properties/renewBefore',
                type: 'string',
                default: '',
              },
              usages: {
                $id: '#/properties/spec/properties/usages',
                type: 'array',
                items: {
                  type: 'string',
                  enum: [
                    'signing',
                    'digital signature',
                    'content commitment',
                    'key encipherment',
                    'key agreement',
                    'data encipherment',
                    'cert sign',
                    'crl sign',
                    'encipher only',
                    'decipher only',
                    'any',
                    'server auth',
                    'client auth',
                    'code signing',
                    'email protection',
                    's/mime',
                    'ipsec end system',
                    'ipsec tunnel',
                    'ipsec user',
                    'timestamping',
                    'ocsp signing',
                    'microsoft sgc',
                    'netscape sgc',
                  ],
                },
              },
              secretName: {
                $id: '#/properties/spec/properties/secretName',
                type: 'string',
                default: '',
              },
              issuerRef: {
                $id: '#/properties/spec/properties/issuerRef',
                type: 'object',
                default: {},
                required: ['kind', 'name'],
                properties: {
                  kind: {
                    $id: '#/properties/spec/properties/issuerRef/properties/kind',
                    type: 'string',
                    default: '',
                    const: 'Issuer',
                  },
                  name: {
                    $id: '#/properties/spec/properties/issuerRef/properties/name',
                    type: 'string',
                    default: '',
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
