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
  <v-flex>
    <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('tip.comment')])" />
    <v-card-text class="pa-2">
      <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
        <v-row>
          <v-col v-if="!reply" cols="12">
            <label class="v-label theme--light">{{ i18nLocal.t('tip.user_comment') }}</label>
            <v-rating
              v-model="obj.rating"
              background-color="orange lighten-3"
              color="orange"
              dense
              :rules="objRules.rating"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="obj.content"
              auto-grow
              :label="reply ? i18nLocal.t('operate.reply_c', [i18nLocal.t('tip.comment')]) : i18nLocal.t('tip.comment')"
              :rules="objRules.content"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-flex>
</template>

<script lang="ts" setup>
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../../i18n';
  import { useGlobalI18n } from '@/i18n';
  import { AIModelComment } from '@/types/ai_model';
  import { deepCopy } from '@/utils/helpers';
  import { required } from '@/utils/rules';

  const props = withDefaults(
    defineProps<{
      item?: AIModelComment;
      reply?: boolean;
    }>(),
    {
      item: undefined,
      reply: false,
    },
  );

  const i18nLocal = useI18n();
  const i18n = useGlobalI18n();

  const state = reactive({
    valid: false,
  });

  const obj = ref<AIModelComment>(
    new AIModelComment({
      rating: 0,
      content: '',
      postID: '',
      replyID: '',
    }),
  );
  const objRules = {
    rating: [required],
    content: [required],
  };

  const form = ref(null);
  const setData = (data: AIModelComment): void => {
    obj.value = deepCopy(data);
    if (form.value) {
      form.value.resetValidation();
    }
  };

  const getData = (): AIModelComment => {
    return obj.value;
  };

  const validate = (): boolean => {
    return form.value.validate(true);
  };

  const reset = (): void => {
    form.value.resetValidation();
    obj.value = new AIModelComment({
      rating: 0,
      content: '',
      postID: '',
      replyID: '',
    });
  };

  defineExpose({
    setData,
    getData,
    validate,
    reset,
  });

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      setData(newValue);
    },
    { immediate: true, deep: true },
  );
</script>
