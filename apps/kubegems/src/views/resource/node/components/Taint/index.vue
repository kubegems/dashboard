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
      <v-flex class="px-4 pb-4">
        <div v-for="(t, index) in taint.spec.taints || []" :key="index" class="mr-2 my-1">
          <div class="success white--text float-left taint__left text-caption">
            <div class="primary pl-2 pr-1 taint__front">
              <v-icon color="white" small> mdi-asterisk </v-icon>
              <strong class="mr-1"> {{ t.key }} </strong>
            </div>
          </div>
          <div class="success white--text float-left taint__right text-caption px-2">
            <strong>{{ t.effect }}</strong>
            <v-btn color="white" icon x-small @click="removeTaint(t)">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </div>
          <div class="kubegems__clear-float" />
        </div>
      </v-flex>

      <AddTaint ref="addTaint" @refresh="refreshTaint" />
    </v-card-text>
  </v-card>
</template>
<script>
  import { getNodeDetail, patchTaintNode } from '@kubegems/api/direct';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapGetters } from 'vuex';

  import messages from '../../i18n';
  import AddTaint from './AddTaint';

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

<style lang="scss" scoped>
  .taint {
    position: relative;

    &__front {
      border-radius: 20px;
    }

    &__left {
      border-top-left-radius: 20px;
      border-bottom-left-radius: 20px;
      line-height: 22px;
    }

    &__right {
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
      line-height: 22px;
      max-width: 350px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: auto;
    }
  }
</style>
