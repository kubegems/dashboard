const ParamsMixin: { [key: string]: any } = {
  methods: {
    jsonParams(name: string, data: { [key: string]: any }): { [key: string]: any } {
      return {
        name,
        parameters: {
          content_type: 'json',
        },
        shape: [1],
        datatype: 'BYTES',
        data: JSON.stringify(data),
      };
    },
    imageParam(name: string, ...imagedatas: { [key: string]: any }[]): { [key: string]: any } {
      return {
        name,
        parameters: {
          content_type: 'image',
        },
        shape: [1],
        datatype: 'BYTES',
        data: imagedatas,
      };
    },
    stringParam(name: string, ...elements: { [key: string]: any }[]): { [key: string]: any } {
      return {
        name,
        parameters: {
          content_type: 'string',
        },
        shape: [1],
        datatype: 'BYTES',
        data: elements,
      };
    },
    stringArrayParam(name: string, ...elements: { [key: string]: any }[]): { [key: string]: any } {
      return {
        name: name,
        shape: [1],
        datatype: 'BYTES',
        data: elements,
      };
    },
    conversationParam(name: string, ...elements: { [key: string]: any }[]): { [key: string]: any } {
      return {
        name: name,
        parameters: {
          content_type: 'conversation',
        },
        shape: [1],
        datatype: 'BYTES',
        data: JSON.stringify(elements),
      };
    },
    audioParam(name: string, ...elements: { [key: string]: any }[]): { [key: string]: any } {
      return {
        name: name,
        parameters: {
          content_type: 'audio',
        },
        shape: [1],
        datatype: 'BYTES',
        data: elements,
      };
    },
    composeInputs(...inputs: { [key: string]: any }[]): { [key: string]: any } {
      return {
        inputs: inputs,
      };
    },
  },
};

export default ParamsMixin;
