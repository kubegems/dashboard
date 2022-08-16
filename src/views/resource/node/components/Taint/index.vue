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
    <v-card-text class="pa-0 pt-1">
      <BaseSubTitle :divider="false" :title="$t('table.taint')">
        <template #action>
          <v-btn class="float-right mr-2" color="primary" small text @click="addTaint">
            <v-icon left small> mdi-tag-plus </v-icon>
            {{ $root.$t('operate.add_c', [$t('table.taint')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-flex class="pb-4">
        <v-sheet v-for="(t, index) in taint.spec.taints" :key="index" class="ml-2">
          <v-chip
            class="my-1"
            close
            close-icon="mdi-delete"
            color="success"
            small
            text-color="white"
            @click:close="removeTaint(t)"
          >
            <v-icon left small> mdi-asterisk </v-icon>
            <span class="mr-2">
              <strong class="mx-1"> key </strong>
              {{ t.key }}
            </span>
            <span class="mr-2">
              <strong class="mx-1"> value </strong>
              {{ t.value }}
            </span>
            <span class="mr-2">
              <strong class="mx-1"> effect </strong>
              {{ t.effect }}
            </span>
          </v-chip>
          <div class="kubegems__clear-float" />
        </v-sheet>
      </v-flex>

      <AddTaint ref="addTaint" @refresh="refreshTaint" />
    </v-card-text>
  </v-card>
</template>
<script>
  import { mapGetters } from 'vuex';

  import messages from '../../i18n';
  import AddTaint from './AddTaint';
  import { getNodeDetail, patchTaintNode } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'Taint',
    i18n: {
      messages: messages,
    },
    components: {
      AddTaint,
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
        taint: {
          spec: {
            taints: [],
          },
        },
      };
    },
    computed: {
      ...mapGetters(['Cluster']),
    },
    watch: {
      item() {
        this.taint = deepCopy(this.item);
        if (!this.taint.spec.taints) this.taint.spec.taints = [];
      },
    },
    mounted() {
      this.nodeDetail();
    },
    methods: {
      removeTaint(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$t('table.taint')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$t('table.taint')])} ${item.key}`,
            type: 'delete',
            name: item.key,
          },
          param: { item },
          doFunc: async (param) => {
            const taints = this.taint.spec.taints.filter((t) => {
              return !(t.key === param.item.key && t.value === param.item.value);
            });
            await patchTaintNode(this.ThisCluster, this.item.metadata.name, {
              Taints: taints,
            });
            this.nodeDetail();
          },
        });
      },
      addTaint() {
        this.$refs.addTaint.setItem(this.item);
        this.$refs.addTaint.open();
      },
      refreshTaint() {
        this.nodeDetail();
      },
      async nodeDetail() {
        const data = await getNodeDetail(this.ThisCluster, this.$route.params.name, {
          noprocessing: true,
        });
        this.taint = data;
      },
    },
  };
</script>
