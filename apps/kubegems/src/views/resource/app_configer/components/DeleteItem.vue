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
  <v-row justify="center">
    <v-dialog v-model="show" max-width="800" persistent>
      <v-card>
        <v-card-title class="text-h5 error--text">
          {{ $root.$t('operate.delete_c', [$t('tip.config')]) }}
        </v-card-title>
        <v-divider />
        <v-card-text class="text-subtitle-1 kubegems__text pt-3">
          {{ $t('tip.delete_tip', [item.tenant, item.project, item.environment, item.key]) }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary light-2" text @click="cancel"> {{ $root.$t('operate.cancel') }} </v-btn>
          <v-btn color="red darken-1" text @click="submit"> {{ $root.$t('operate.confirm') }} </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
  import messages from '../i18n';

  export default {
    name: 'DeleteItem',
    i18n: {
      messages: messages,
    },
    props: {
      showDeleteDialog: {
        type: Boolean,
        default: false,
      },
      item: {
        type: Object,
        default: () => {
          return {
            tenant: '',
            project: '',
            environment: '',
          };
        },
      },
      idx: {
        type: Number,
        default: -1,
      },
    },
    data() {
      return {
        show: false,
      };
    },
    watch: {
      showDeleteDialog: {
        handler(val) {
          this.show = val;
        },
        immediate: true,
      },
    },
    methods: {
      cancel() {
        this.$emit('close');
      },
      submit() {
        this.$emit('delete', this.idx);
      },
    },
  };
</script>
