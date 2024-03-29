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
    <v-sheet class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text" />
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item class="float-left py-0 pl-0" :style="{ width: `600px` }" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1"> {{ getAuthType() }} </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1">
                  {{ i18nLocal.t('tip.auth_type') }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updateData">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removeData">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
  </v-flex>
</template>

<script lang="ts" setup>
  import { AIModelRegistry } from '@kubegems/api/typed/ai_model';

  import { useI18n } from '../../../../i18n';

  const props = withDefaults(
    defineProps<{
      registry?: AIModelRegistry;
    }>(),
    {
      registry: undefined,
    },
  );

  const i18nLocal = useI18n();

  const getAuthType = (): string => {
    if (props.registry?.auth?.username && props.registry?.auth?.token) {
      return i18nLocal.t('tip.passwd_or_token_auth').toString();
    }
    if (props.registry?.auth?.username) {
      return i18nLocal.t('tip.passwd_auth').toString();
    }
    if (props.registry?.auth?.token) {
      return i18nLocal.t('tip.token_auth').toString();
    }
    return '';
  };

  const emit = defineEmits(['updateData', 'removeData', 'expandCard']);
  const updateData = (): void => {
    emit('updateData');
  };

  const removeData = (): void => {
    emit('removeData');
  };

  const expandCard = () => {
    emit('expandCard', 'auth');
  };

  defineExpose({
    expandCard,
  });
</script>
