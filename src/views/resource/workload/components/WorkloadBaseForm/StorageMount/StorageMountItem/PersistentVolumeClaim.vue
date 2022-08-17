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
  <v-flex class="float-left">
    <v-list-item class="float-left px-0" :style="{ width: `296px` }" two-line>
      <v-list-item-content class="py-0">
        <v-list-item-title class="text-subtitle-2 py-1">
          {{
            pvcs && pvcs[item.persistentVolumeClaim.claimName]
              ? pvcs[item.persistentVolumeClaim.claimName].spec.storageClassName
              : $root.$t('data.unknown')
          }}&nbsp;
        </v-list-item-title>
        <v-list-item-subtitle class="text-body-2 py-1"> {{ $root.$t('resource.type') }} </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="float-left px-0" :style="{ width: `150px` }" two-line>
      <v-list-item-content class="py-0">
        <v-list-item-title class="text-subtitle-2 py-1">
          {{
            pvcs[item.persistentVolumeClaim.claimName]
              ? pvcs[item.persistentVolumeClaim.claimName].spec.resources.requests.storage
              : '0Gi'
          }}&nbsp;
        </v-list-item-title>
        <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.capacity') }} </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="float-left px-0" :style="{ width: `150px` }" two-line>
      <v-list-item-content class="py-0">
        <v-list-item-title class="text-subtitle-2 py-1">
          {{
            pvcs && pvcs[item.persistentVolumeClaim.claimName]
              ? pvcs[item.persistentVolumeClaim.claimName].spec.accessModes[0]
              : $root.$t('data.unknown')
          }}&nbsp;
        </v-list-item-title>
        <v-list-item-subtitle class="text-body-2 py-1"> {{ $t('tip.access_mode') }} </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
    <v-list-item class="float-left px-0" :style="{ width: `250px` }" two-line>
      <v-list-item-content class="py-0">
        <v-list-item-title class="text-subtitle-2 py-1">
          {{
            pvcs && pvcs[item.persistentVolumeClaim.claimName]
              ? pvcs[item.persistentVolumeClaim.claimName].metadata.name
              : $root.$t('data.unknown')
          }}&nbsp;
        </v-list-item-title>
        <v-list-item-subtitle class="text-body-2 py-1">
          {{ $root.$t('resource.persistentvolumeclaim') }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </v-flex>
</template>

<script>
  import messages from '../../../../i18n';

  export default {
    name: 'PersistentVolumeClaim',
    i18n: {
      messages: messages,
    },
    props: {
      item: {
        type: Object,
        default: () => {},
      },
      pvcs: {
        type: Object,
        default: () => {},
      },
    },
  };
</script>
