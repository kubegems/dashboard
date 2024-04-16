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
  <v-menu
    :close-delay="200"
    :close-on-content-click="false"
    :disabled="disabled"
    left
    max-width="210px"
    nudge-bottom="5px"
    offset-y
    open-on-hover
    :origin="`${top ? 'bottom center' : 'top center'}`"
    :top="top"
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <span
        class="kubegems__pointer kubegems__attach-position"
        v-on="on"
        @mouseenter.passive="getLatestEvent"
        @mouseout.passive="removeEvent"
      >
        <slot name="trigger" />
      </span>
    </template>
    <v-card flat :loading="state.eventLoad" width="100%">
      <v-flex class="text-body-2 text-center primary white--text py-2">
        <v-icon color="white" left small> mdi-bell-ring </v-icon>
        <span>{{ i18nLocal.t('tip.event') }}</span>
      </v-flex>
      <v-list class="pa-0 kubegems__tip" dense>
        <v-list-item>
          <v-list-item-content v-if="event">
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title> {{ i18nLocal.t('tip.last_at') }} </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  {{ event.message }}
                </v-list-item-content>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="float-left pa-0" two-line>
              <v-list-item-content class="py-0">
                <v-list-item-title> {{ i18nLocal.t('tip.trigger_at') }} </v-list-item-title>
                <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                  {{
                    event.metadata.creationTimestamp
                      ? moment(event.metadata.creationTimestamp, 'YYYY-MM-DDTHH:mm:ssZ').fromNow()
                      : ''
                  }}
                </v-list-item-content>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-content>
          <v-flex v-else class="text-caption kubegems__text text-center"> {{ i18n.t('data.no_data') }} </v-flex>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script lang="ts" setup>
  import { getEventList } from '@kubegems/api/direct';
  import { convertResponse2List } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useCluster } from '@kubegems/extension/resource';
  import { useStore } from '@kubegems/extension/store';
  import moment from 'moment';
  import { reactive, ref } from 'vue';

  import { useI18n } from './i18n';

  const props = withDefaults(
    defineProps<{
      disabled?: boolean;
      top?: boolean;
      item?: any;
      kind?: string;
      for?: string;
    }>(),
    {
      disabled: false,
      top: false,
      item: void 0,
      kind: 'Pod',
      for: 'kubegems',
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const state = reactive({
    eventLoad: false,
    timeout: void 0,
  });
  const event = ref(void 0);

  const getLatestEvent = async (): Promise<void> => {
    event.value = void 0;
    state.timeout = setTimeout(async () => {
      state.eventLoad = true;
      const data = await getEventList(
        props.for === 'pai' ? store.getters.Region().ClusterName : useCluster(),
        props.item?.metadata?.namespace,
        {
          topkind: props.kind,
          topname: props.item?.metadata?.name,
          page: 1,
          size: 1,
          noprocessing: true,
        },
      );
      const d = convertResponse2List(data as any);
      if (d.length > 0) {
        event.value = d[0];
      }
      state.eventLoad = false;
      clearTimeout(state.timeout);
    }, 200);
  };

  const removeEvent = (): void => {
    if (state.timeout) clearTimeout(state.timeout);
  };
</script>
