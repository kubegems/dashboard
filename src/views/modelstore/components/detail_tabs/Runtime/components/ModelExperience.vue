<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

<template>
  <BaseFullScreenDialog v-model="dialog" icon="mdi-variable" :title="$t('tip.experience')" @dispose="dispose">
    <template #content>
      <component :is="formComponent" />
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../../i18n';
  import Conversation from './ConversationText';
  import ImageSegmentation from './ImageSegmentation';
  import QuestionAnswer from './QuestionAnswer';
  import SingleFile from './SingleFile';
  import SingleImage from './SingleImage';
  import SingleText from './SingleText';
  import SingleTextInputs from './SingleTextInputs';
  // import TableQuestionAnswer from './TableQuestionAnswer';
  import VisualQuestionAnswer from './VisualQuestionAnswer';
  // import ZeroShotClassification from './ZeroShotClassification';

  export default {
    name: 'ModelExperience',
    i18n: {
      messages: messages,
    },
    components: {
      Conversation,
      ImageSegmentation,
      QuestionAnswer,
      SingleFile,
      SingleImage,
      SingleText,
      SingleTextInputs,
      // TableQuestionAnswer,
      VisualQuestionAnswer,
      // ZeroShotClassification,
    },
    props: {
      // item: {
      //   type: Object,
      //   default: () => null,
      // },
    },
    data: () => ({
      dialog: false,
      formComponent: 'SingleFile',
    }),
    computed: {
      ...mapState(['JWT']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      dispose() {},
    },
  };
</script>
