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
  <BaseDialog v-model="state.dialog" icon="mdi-label" :title="i18nLocal.t('tip.label')" :width="500" @reset="reset">
    <template #content>
      <v-flex>
        <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('tip.label')])" />
        <v-card-text class="pa-2">
          <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  v-model="obj.tags"
                  class="my-0"
                  color="primary"
                  :items="tag.tagItems"
                  :label="i18nLocal.t('tip.label')"
                  multiple
                  :no-data-text="i18n.t('data.no_data')"
                  :rules="objRules.tags"
                  :search-input.sync="tag.tagText"
                  @keyup.enter="createTag"
                >
                  <template #selection="{ item }">
                    <v-chip color="primary" small>
                      {{ item['text'] }}
                      <v-icon right small @click="removeTag(item.text)">mdi-close</v-icon>
                    </v-chip>
                  </template>
                </v-autocomplete>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-flex>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="updateTag">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { AIModel } from '@kubegems/api/typed/ai_model';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
  });

  const obj = ref({
    tags: [],
  });
  const objRules = {
    tags: [required],
  };

  const open = (): void => {
    state.dialog = true;
  };

  const init = (item: AIModel): void => {
    obj.value = deepCopy(item);
    tag.tagItems = item.tags
      ? item.tags.map((t) => {
          return { text: t, value: t };
        })
      : [];
  };

  defineExpose({
    open,
    init,
  });

  const form = ref(null);
  const reset = (): void => {
    state.dialog = false;
    obj.value = {
      tags: [],
    };
    form.value.resetValidation();
  };

  const tag = reactive({
    tagText: '',
    tagItems: [],
  });
  const createTag = (): void => {
    if (
      tag.tagText &&
      !tag.tagItems.some((i) => {
        return i.value === tag.tagText;
      })
    ) {
      tag.tagItems.push({ text: tag.tagText, value: tag.tagText });
      if (!obj.value.tags) obj.value.tags = [];
      obj.value.tags.push(tag.tagText);
    }
    tag.tagText = '';
  };

  const removeTag = (tag: any): void => {
    const index = obj.value.tags.findIndex((i) => {
      return i === tag;
    });
    if (index > -1) {
      obj.value.tags.splice(index, 1);
    }
  };

  const emit = defineEmits(['refresh']);
  const updateTag = async (): Promise<void> => {
    if (form.value.validate(true)) {
      await new AIModel(obj.value).updateModelByAdmin();
      reset();
      emit('refresh');
    }
  };
</script>
