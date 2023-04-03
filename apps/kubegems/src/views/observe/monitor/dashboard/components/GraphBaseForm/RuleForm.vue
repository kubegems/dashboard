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
  <v-form ref="form" v-model="state.valid" class="my-2" lazy-validation @submit.prevent>
    <v-expand-transition>
      <v-card v-show="state.expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4" flat>
        <v-sheet class="px-2">
          <v-flex class="float-left text-subtitle-2 py-1 pt-5 primary--text kubegems__min-width">
            <span>{{ i18nLocal.t('tip.target_name') }}</span>
          </v-flex>
          <v-flex class="float-left ml-2 kubegems__form-width">
            <v-text-field
              v-model="target.targetName"
              class="my-0"
              :label="i18nLocal.t('tip.target_name')"
              required
              :rules="rulers.targetNameRule"
            />
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>

        <v-card-text class="pa-0">
          <template v-if="mode === 'template'">
            <v-sheet class="px-2">
              <v-flex class="float-left text-subtitle-2 py-1 pt-5 primary--text kubegems__min-width">
                <span>{{ i18nLocal.t('tip.template') }}</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <ResourceSelectCascade
                  ref="resourceSelectCascade"
                  v-model="resource"
                  :generator="generator"
                  single-line
                  :tenant="store.getters.Tenant()"
                  @setData="set"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </template>

          <template v-if="mode === 'ql'">
            <v-sheet class="px-2">
              <v-flex class="float-left text-subtitle-2 py-1 pt-5 primary--text kubegems__min-width">
                <span>{{ i18nLocal.t('tip.query_ql') }}</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__long-width">
                <v-textarea
                  v-model="target.expr"
                  auto-grow
                  :label="i18nLocal.t('tip.query_ql')"
                  :rules="rulers.exprRule"
                />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </template>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn color="error" small text @click="close"> {{ i18n.t('operate.cancel') }} </v-btn>
          <v-btn color="primary" small text @click="add"> {{ i18n.t('operate.save') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script lang="ts" setup>
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useStore } from '@kubegems/extension/store';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import { required } from '@kubegems/libs/utils/rules';
  import { reactive, ref, watch } from 'vue';

  import { useI18n } from '../../../i18n';
  import { MonitorTarget, PromqlGenerator } from '@/types/monitor';
  import ResourceSelectCascade from '@/views/observe/monitor/metrics/components/ResourceSelectCascade.vue';

  const store = useStore();
  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();

  const props = withDefaults(
    defineProps<{
      mode?: string;
      targets?: MonitorTarget[];
    }>(),
    {
      mode: 'template',
      targets: undefined,
    },
  );

  watch(
    () => props.targets,
    async (newValue) => {
      if (newValue) {
        targets.value = deepCopy(newValue);
      }
    },
    {
      deep: true,
    },
  );

  const state = reactive({
    valid: false,
    expand: false,
  });

  const target = ref<MonitorTarget>(new MonitorTarget());
  const targets = ref<MonitorTarget[]>([]);
  const generator = ref<PromqlGenerator>(undefined);
  const rulers = ref({
    targetNameRule: [required],
    resourceRule: [required],
    ruleRule: [required],
    exprRule: [required],
  });
  const init = (tar: MonitorTarget, gen: PromqlGenerator): void => {
    target.value = tar;
    generator.value = gen;
    state.expand = true;
  };
  const expand = (): void => {
    state.expand = true;
    form.value.resetValidation();
  };

  const emit = defineEmits(['addData', 'closeOverlay']);
  const form = ref(null);
  const add = (): void => {
    if (form.value.validate(true)) {
      if (target.value.index === undefined) {
        targets.value.push(target.value);
      } else {
        targets.value[target.value.index] = target.value;
      }
      emit('addData', targets.value);
      close();
    }
  };

  const resource = ref(undefined);
  const set = (): void => {
    if (resource.value) {
      target.value.promqlGenerator = new PromqlGenerator(resource.value);
      target.value.unit = resource.value.unit;
    }
  };

  const resourceSelectCascade = ref(null);
  const close = (): void => {
    state.expand = false;
    target.value = new MonitorTarget();
    resource.value = undefined;
    if (resourceSelectCascade.value) resourceSelectCascade.value.reset();
    emit('closeOverlay');
  };

  defineExpose({
    init,
    expand,
    close,
  });
</script>
