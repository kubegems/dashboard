const ParamsMixin = {
  methods: {
    jsonParams(name, data) {
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
    imageParam(name, ...imagedatas) {
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
    stringParam(name, ...elements) {
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
    stringArrayParam(name, ...elements) {
      return {
        name: name,
        shape: [1],
        datatype: 'BYTES',
        data: elements,
      };
    },
    conversationParam(name, ...elements) {
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
    audioParam(name, ...elements) {
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
    composeInputs(...inputs) {
      return {
        inputs: inputs,
      };
    },
  },
};

export default ParamsMixin;
