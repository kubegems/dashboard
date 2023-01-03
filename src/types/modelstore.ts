type Parameter = {
  content_type: string;
};

type Output = {
  name: string;
  parameters: Parameter;
  shape: number[];
  data: string[];
};

export type InferenceResponse = {
  model: string;
  version: string;
  parameters: Parameter;
  outputs: Output[];
};

export type Conversation = {
  uuid: string;
  new_user_input: string;
  past_user_inputs: string[];
  generated_responses: string[];
};
