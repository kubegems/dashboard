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
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-tag-plus"
    :title="i18n.t('operate.add_c', [i18nLocal.t('tip.label')])"
    :width="500"
    @reset="reset"
  >
    <template #content>
      <BaseSubTitle :title="i18n.t('form.definition', [i18nLocal.t('tip.label')])" />
      <v-card-text class="pa-2">
        <v-form ref="form" v-model="state.valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field v-model="obj.key" class="my-0" :label="i18n.t('form.key')" required :rules="objRules.key" />
            <v-text-field
              v-model="obj.value"
              class="my-0"
              :label="i18n.t('form.value')"
              required
              :rules="objRules.value"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="store.state.Circular" text @click="addLabel">
        {{ i18n.t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { Node } from '@kubegems/api/typed/node';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useCluster } from '@kubegems/extension/resource';
  import { k8sLabel, required } from '@kubegems/extension/ruler';
  import { useStore } from '@kubegems/extension/store';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../i18n';

  const props = withDefaults(
    defineProps<{
      item?: Node;
    }>(),
    {
      item: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    dialog: false,
    valid: false,
  });

  const obj = ref({
    key: '',
    value: '',
  });
  const objRules = {
    key: [required, k8sLabel],
    value: [required, k8sLabel],
  };

  const open = (): void => {
    state.dialog = true;
  };

  const node = ref<Node>(new Node());
  defineExpose({
    open,
  });

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      node.value = newValue;
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const emit = defineEmits(['refresh']);
  const addLabel = async (): Promise<void> => {
    if (form.value.validate(true)) {
      node.value.metadata.labels[obj.value.key] = obj.value.value;
      await new Node(node.value).metaNode(useCluster());
      emit('refresh', obj.value, 'label');
      reset();
    }
  };

  const form = ref(null);
  const reset = (): void => {
    state.dialog = false;
    form.value.reset();
    obj.value = {
      key: '',
      value: '',
    };
    node.value = new Node();
  };
</script>
