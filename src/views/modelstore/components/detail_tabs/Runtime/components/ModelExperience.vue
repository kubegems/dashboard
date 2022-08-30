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
    <template #header>
      <v-flex class="ml-2 text-h6 mt-n1">
        {{ item ? item.name : '' }}
      </v-flex>
    </template>
    <template #content>
      <component :is="formComponent" :instance="instance" />
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../../../../i18n';
  import Conversation from './tasks/ConversationText';
  import ImageSegmentation from './tasks/ImageSegmentation';
  import QuestionAnswer from './tasks/QuestionAnswer';
  import SingleFile from './tasks/SingleFile';
  import SingleImage from './tasks/SingleImage';
  import SingleText from './tasks/SingleText';
  import SingleTextInputs from './tasks/SingleTextInputs';
  import TableQuestionAnswer from './tasks/TableQuestionAnswer';
  import VisualQuestionAnswer from './tasks/VisualQuestionAnswer';
  import ZeroShotClassification from './tasks/ZeroShotClassification';

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
      TableQuestionAnswer,
      VisualQuestionAnswer,
      ZeroShotClassification,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      dialog: false,
      instance: undefined,
      formComponent: '',
      formConponentItems: {
        openmmlab: SingleImage,
        'text-generation': SingleText,
        'text-classification': SingleText,
        'text2text-generation': SingleText,
        'token-classification': SingleTextInputs,
        'question-anwser': QuestionAnswer,
        'table-question-anwser': TableQuestionAnswer,
        'feature-extraction': SingleText,
        'visual-question-anwser': VisualQuestionAnswer,
        'fill-mask': SingleText,
        summarization: SingleText,
        'zero-shot-classification': ZeroShotClassification,
        'image-classification': SingleImage,
        'image-segmentation': ImageSegmentation,
        'object-detection': ImageSegmentation,
        conversation: Conversation,
        translation: SingleText,
        'audio-classification': SingleFile,
        'automatic-speech-recognition': SingleFile,
      },
    }),
    computed: {
      ...mapState(['JWT']),
    },
    watch: {
      item: {
        handler(newValue) {
          if (newValue) {
            if (newValue.source === 'openmmlab') {
              this.formComponent = this.formConponentItems['openmmlab'];
              return;
            } else if (newValue.source === 'huggingface') {
              if (Object.prototype.hasOwnProperty.call(this.formConponentItems, newValue.task)) {
                this.formComponent = this.formConponentItems[newValue.task];
                return;
              }
            }
            this.$store.commit('SET_SNACKBAR', {
              text: this.$t('tip.not_support'),
              color: 'warning',
            });
            this.dialog = false;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(item) {
        this.instance = item;
      },
      dispose() {},
    },
  };
</script>
