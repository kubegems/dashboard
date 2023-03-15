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
  <BaseDialog v-model="state.dialog" icon="mdi-comment" :title="state.title" :width="500" @reset="reset">
    <template #content>
      <CommentBaseForm ref="form" :item="comment" :reply="state.reply" />
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="confirm">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { reactive, ref } from 'vue';

  import CommentBaseForm from './CommentBaseForm.vue';
  import { useGlobalI18n } from '@/i18n';
  import { useParams, useQuery } from '@/router';
  import { useStore } from '@/store';
  import { AIModelComment } from '@/types/ai_model';

  const i18n = useGlobalI18n();
  const store = useStore();
  const query = useQuery();
  const params = useParams();

  const state = reactive({
    dialog: false,
    title: '',
    reply: false,
  });

  const open = (title: string): void => {
    state.dialog = true;
    state.title = title;
  };

  const comment = ref<AIModelComment>(undefined);
  const init = (item: AIModelComment, reply: boolean): void => {
    state.reply = reply;
    comment.value = item;
  };

  defineExpose({
    open,
    init,
  });

  const emit = defineEmits(['refresh']);
  const form = ref(null);
  const confirm = async (): Promise<void> => {
    if (form.value.validate()) {
      const data = form.value.getData();
      if (data.id) {
        await new AIModelComment(data).updateComment(query.value.registry, params.value.name);
      } else {
        await new AIModelComment(data).addComment(query.value.registry, params.value.name);
      }
      reset();
      emit('refresh', state.reply, data?.replyTo?.rootID);
    }
  };

  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
    state.reply = false;
  };
</script>
