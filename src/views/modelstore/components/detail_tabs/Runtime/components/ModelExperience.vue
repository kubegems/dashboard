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
  <BaseFullScreenDialog v-model="dialog" icon="mdi-eye" :title="$t('tip.experience')" @dispose="dispose">
    <template #header>
      <v-flex class="ml-2 text-h6 mt-n1">
        {{ item ? item.name : '' }}
        {{ $t('tip.task_type') }}:
        {{ item ? item.task : '' }}
      </v-flex>
    </template>
    <template #content>
      <component :is="formComponent" :current-task="currentTask" :dialog="dialog" :instance="instance" />
    </template>
  </BaseFullScreenDialog>
</template>

<script>
  import messages from '../../../../i18n';
  import Conversation from './tasks/ConversationText';
  import FileInputs from './tasks/FileInputs';
  import ImageSegmentation from './tasks/ImageSegmentation';
  import QuestionAnswer from './tasks/QuestionAnswer';
  import SingleImage from './tasks/SingleImage';
  import TableQuestionAnswer from './tasks/TableQuestionAnswer';
  import TextInputs from './tasks/TextInputs';
  import VisualQuestionAnswer from './tasks/VisualQuestionAnswer';
  import ZeroShotClassification from './tasks/ZeroShotClassification';
  import ZeroShotImageClassification from './tasks/ZeroShotImageClassification';

  export default {
    name: 'ModelExperience',
    i18n: {
      messages: messages,
    },
    components: {
      Conversation,
      ImageSegmentation,
      QuestionAnswer,
      FileInputs,
      SingleImage,
      TextInputs,
      TableQuestionAnswer,
      VisualQuestionAnswer,
      ZeroShotClassification,
      ZeroShotImageClassification,
    },
    props: {
      item: {
        type: Object,
        default: () => {
          return {
            source: 'huggingface',
            task: 'text-generation',
          };
        },
      },
    },
    data() {
      return {
        dialog: false,
        currentTask: '',
        instance: {},
        formComponent: '',
        formConponentItems: {
          openmmlab: SingleImage,
          'text-generation': TextInputs,
          'text-classification': TextInputs,
          'text2text-generation': TextInputs,
          'token-classification': TextInputs,
          'question-anwser': QuestionAnswer,
          'table-question-anwser': TableQuestionAnswer,
          'feature-extraction': TextInputs,
          'visual-question-answering': VisualQuestionAnswer,
          'fill-mask': TextInputs,
          summarization: TextInputs,
          'zero-shot-classification': ZeroShotClassification,
          'zero-shot-image-classification': ZeroShotImageClassification,
          'image-classification': SingleImage,
          'image-segmentation': ImageSegmentation,
          'object-detection': ImageSegmentation,
          conversation: Conversation,
          translation: TextInputs,
          'audio-classification': FileInputs,
          'automatic-speech-recognition': FileInputs,
        },
      };
    },
    watch: {
      currentTask: {
        handler(nv) {
          this.formComponent = this.formConponentItems[nv];
        },
      },
      item: {
        handler(newValue) {
          if (newValue) {
            if (newValue.source === 'openmmlab') {
              this.formComponent = this.formConponentItems['openmmlab'];
              return;
            } else {
              if (Object.prototype.hasOwnProperty.call(this.formConponentItems, newValue.task)) {
                this.formComponent = this.formConponentItems[newValue.task];
                return;
              }
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      open() {
        if (!this.formComponent) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$t('tip.not_support'),
            color: 'warning',
          });
          return;
        }
        this.dialog = true;
      },
      init(item) {
        this.instance = item;
      },
      dispose() {
        return;
      },
    },
  };
</script>
