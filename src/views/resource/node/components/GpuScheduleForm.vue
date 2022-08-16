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
  <BaseDialog v-model="dialog" icon="mdi-tag-plus" :title="$t('tip.schedule')" :width="500" @reset="reset">
    <template #content>
      <BaseSubTitle :title="$root.$t('form.definition', [$t('tip.schedule')])" />
      <v-card-text class="px-2 py-0">
        <v-list dense>
          <v-list-item-group active-class="primary--text" multiple>
            <v-list-item class="mb-3" link>
              <v-list-item-content class="text-body-2">
                <v-checkbox v-model="tke" class="ml-3" hide-details>
                  <template #label>
                    <BaseLogo icon-name="tke" :width="28" />
                    <span class="mx-2">TKE GPU vcuda</span>
                  </template>
                </v-checkbox>
              </v-list-item-content>
            </v-list-item>
            <v-list-item class="mb-3" link>
              <v-list-item-content class="text-body-2">
                <v-checkbox v-model="nvidia" class="ml-3" hide-details>
                  <template #label>
                    <BaseLogo icon-name="nvidia" :width="28" />
                    <span class="mx-2"> {{ $t('tip.nvidia') }} </span>
                  </template>
                </v-checkbox>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="gpuSchedule">
        {{ $root.$t('operate.confirm') }}
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import messages from '../i18n';
  import { patchMetadataNode } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'GpuScheduleForm',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    data: () => ({
      dialog: false,
      item: null,
      tke: false,
      nvidia: false,
    }),
    computed: {
      ...mapState(['Circular', 'Plugins']),
    },
    methods: {
      open() {
        this.dialog = true;
      },
      init(item) {
        this.item = deepCopy(item);
        if (item.metadata.labels['tencent.com/vcuda'] && item.metadata.labels['tencent.com/vcuda'] === 'true') {
          this.tke = true;
        }
        if (item.metadata.labels['nvidia.com/gpu'] && item.metadata.labels['nvidia.com/gpu'] === 'true') {
          this.nvidia = true;
        }
      },
      async gpuSchedule() {
        if (this.tke) {
          this.item.metadata.labels['tencent.com/vcuda'] = 'true';
        } else {
          delete this.item.metadata.labels['tencent.com/vcuda'];
        }

        if (this.nvidia) {
          this.item.metadata.labels['nvidia.com/gpu'] = 'true';
        } else {
          delete this.item.metadata.labels['nvidia.com/gpu'];
        }

        await patchMetadataNode(this.ThisCluster, this.item.metadata.name, {
          Annotations: this.item.metadata.annotations,
          Labels: this.item.metadata.labels,
        });
        this.reset();
        this.$emit('refresh');
      },
      reset() {
        this.dialog = false;
        this.tke = false;
        this.nvidia = false;
      },
    },
  };
</script>
