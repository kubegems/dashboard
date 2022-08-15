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
  <v-card>
    <v-sheet class="pa-2">
      <BaseListItemForDetail :mt="0" :title="$root.$t('resource.storageclass')">
        <template #content>
          {{ pvc ? pvc.spec.storageClassName : '' }}
        </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail :title="$t('table.access_mode')">
        <template #content>
          {{ pvc ? pvc.spec.accessModes[0] : '' }}
        </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail :title="$t('tip.volume_mode')">
        <template #content>
          {{ pvc ? pvc.spec.volumeMode : '' }}
        </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail :title="$t('tip.volume_name')">
        <template #content>
          {{ pvc ? pvc.spec.volumeName : '' }}
        </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail :title="$t('table.capacity')">
        <template #content>
          {{
            pvc
              ? isNaN(pvc.spec.resources.requests.storage)
                ? pvc.spec.resources.requests.storage
                : `${parseInt(pvc.spec.resources.requests.storage) / 1024 / 1024 / 1024}Gi`
              : ''
          }}
        </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail :title="$t('table.status')">
        <template #content>
          {{ pvc ? pvc.status.phase : '' }}
        </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail :title="$t('table.mount')">
        <template #content>
          <span
            v-if="pvc && pvc.metadata.annotations && pvc.metadata.annotations[`storage.kubegems.io/in-use`] === 'true'"
          >
            <v-icon color="primary" small> mdi-check-circle </v-icon>
          </span>
          <span v-else>
            <v-icon color="error" small> mdi-minus-circle </v-icon>
          </span>
        </template>
      </BaseListItemForDetail>

      <BaseListItemForDetail :title="$t('tip.can_create_snapshot')">
        <template #content>
          <span
            v-if="
              pvc &&
              pvc.metadata.annotations &&
              pvc.metadata.annotations[`storage.kubegems.io/allow-snapshot`] === 'true'
            "
          >
            <v-icon color="primary" small> mdi-check-circle </v-icon>
          </span>
          <span v-else>
            <v-icon color="error" small> mdi-minus-circle </v-icon>
          </span>
        </template>
      </BaseListItemForDetail>
    </v-sheet>
  </v-card>
</template>

<script>
  import messages from '../i18n';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    i18n: {
      messages: messages,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        pvc: null,
      };
    },
    watch: {
      item() {
        this.pvc = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.pvc = deepCopy(this.item);
    },
  };
</script>
