import { Conversation, InferenceResponse } from './../../../../../../types/modelstore';
import { postModelApi, postModelApidev } from '@/api';
import { jsonParse } from '@/utils/helpers';
const ParamsMixin: { [key: string]: any } = {
  props: {
    devMode: {
      type: Boolean,
      default: () => false,
    },
    instance: {
      type: Object,
      default: () => null,
    },
  },
  methods: {
    async infer(body: { [key: string]: any } = {}): Promise<InferenceResponse> {
      if (this.devMode) {
        return await postModelApidev(body);
      } else {
        const url = this.instance?.status?.url || this.instance?.url;
        const baseRex = new RegExp('(http[s]?://.*?)/.*', 'g');
        const match = baseRex.exec(url);
        let modelBaseUrl = '';
        if (match && match?.length > 1) {
          modelBaseUrl = match[1];
        }
        return await postModelApi(
          modelBaseUrl,
          this.instance.namespace || this.instance.metadata.namespace,
          this.instance.name || this.instance.metadata.name,
          body,
        );
      }
    },
    parseResult(response: InferenceResponse): Record<string, any>[] {
      if (response.outputs?.length > 0) {
        const ret: Record<string, any>[] = [];
        response.outputs[0].data.forEach((el) => {
          ret.push(jsonParse(el));
        });
        return ret;
      }
      return [];
    },
    jsonParams(name: string, data: { [key: string]: any }): { [key: string]: any } {
      return {
        name,
        parameters: {
          content_type: 'hg_json',
        },
        shape: [1],
        datatype: 'BYTES',
        data: [JSON.stringify(data)],
      };
    },
    imageParam(name: string, ...imagedatas: { [key: string]: any }[]): { [key: string]: any } {
      return {
        name,
        parameters: {
          content_type: 'pillow_image',
        },
        shape: [imagedatas.length],
        datatype: 'BYTES',
        data: imagedatas,
      };
    },
    stringParam(name: string, ...elements: { [key: string]: any }[]): { [key: string]: any } {
      return {
        name,
        parameters: {
          content_type: 'str',
        },
        shape: [elements.length],
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
    conversationParam(name: string, ...elements: Conversation[]): { [key: string]: any } {
      const conversationDatas = [];
      elements.forEach((el) => {
        conversationDatas.push(JSON.stringify(el));
      });
      return {
        name: name,
        parameters: {
          content_type: 'hg_conversation',
        },
        shape: [conversationDatas.length],
        datatype: 'BYTES',
        data: conversationDatas,
      };
    },
    audioParam(name: string, ...elements: { [key: string]: any }[]): { [key: string]: any } {
      return {
        name: name,
        parameters: {
          content_type: 'base64',
        },
        shape: [elements.length],
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
