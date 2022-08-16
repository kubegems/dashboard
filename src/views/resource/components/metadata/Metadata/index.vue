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
  <div>
    <v-card>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.label')">
        <template v-if="!readonly" #action>
          <v-btn class="float-right mr-2" color="primary" small text @click="addLabel">
            <v-icon left small> mdi-tag-plus </v-icon>
            {{ $root.$t('operate.add_c', [$t('tip.label')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-flex class="px-4">
        <v-flex class="pb-4">
          <v-sheet v-for="(value, key) in metadata ? metadata.labels : []" :key="key" class="ml-2">
            <v-chip
              class="my-1"
              :close="!readonly"
              close-icon="mdi-delete"
              color="success"
              small
              text-color="white"
              @click:close="removeMetadata(key, 'label')"
            >
              <v-icon left small> mdi-label </v-icon>
              <strong class="mx-1"> {{ key }} </strong>
              {{ value }}
            </v-chip>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-flex>
      </v-flex>
    </v-card>

    <v-card class="mt-3" flat>
      <BaseSubTitle class="pt-2" :divider="false" :title="$t('tip.annotation')">
        <template v-if="!readonly" #action>
          <v-btn class="float-right mr-2" color="primary" small text @click="addAnnotation">
            <v-icon left small> mdi-tag-plus </v-icon>
            {{ $root.$t('operate.add_c', [$t('tip.annotation')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-flex class="px-4 pb-4">
        <v-flex>
          <v-sheet v-for="(value, key) in metadata ? metadata.annotations : []" :key="key" class="ml-2">
            <v-chip
              v-if="$ANNOTATION_IGNORE_ARRAY.indexOf(key) === -1"
              class="my-1 kubegems__text"
              :close="!readonly"
              close-icon="mdi-delete"
              color="gray"
              small
              @click:close="removeMetadata(key, 'annotation')"
            >
              <v-icon left small> mdi-label </v-icon>
              <strong class="mx-1"> {{ key }} </strong>
              {{ value }}
            </v-chip>
            <div class="kubegems__clear-float" />
          </v-sheet>
        </v-flex>
      </v-flex>
    </v-card>

    <AddLabel v-if="!readonly" ref="addLabel" :item="item" @refresh="refreshMetadata" />
    <AddAnnotation v-if="!readonly" ref="addAnnotation" :item="item" @refresh="refreshMetadata" />
  </div>
</template>
<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import AddAnnotation from './AddAnnotation';
  import AddLabel from './AddLabel';
  import { patchMetadataNode } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'Metadata',
    i18n: {
      messages: messages,
    },
    components: {
      AddAnnotation,
      AddLabel,
    },
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      readonly: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        metadata: null,
      };
    },
    computed: {
      ...mapState(['JWT']),
      ...mapGetters(['Cluster']),
    },
    watch: {
      item: {
        handler: function () {
          if (this.item && this.item.metadata) {
            this.metadata = deepCopy(this.item.metadata);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      removeMetadata(item, type) {
        this.$store.commit('SET_CONFIRM', {
          title:
            type === 'label'
              ? this.$root.$t('operate.delete_c', [this.$t('tip.label')])
              : this.$root.$t('operate.delete_c', [this.$t('tip.annotation')]),
          content: {
            text:
              type === 'label'
                ? `${this.$root.$t('operate.delete_c', [this.$t('tip.label')])} ${item}`
                : `${this.$root.$t('operate.delete_c', [this.$t('tip.annotation')])} ${item}`,
            type: 'delete',
            name: item,
          },
          param: { item, type },
          doFunc: async (param) => {
            if (param.type === 'label') {
              this.$delete(this.metadata.labels, param.item);
            } else if (param.type === 'annotation') {
              this.$delete(this.metadata.annotations, param.item);
            }
            await patchMetadataNode(this.ThisCluster, this.metadata.name, {
              Annotations: this.metadata.annotations,
              Labels: this.metadata.labels,
            });
          },
        });
      },
      addLabel() {
        this.$refs.addLabel.open();
      },
      addAnnotation() {
        this.$refs.addAnnotation.open();
      },
      refreshMetadata(obj, type) {
        if (type === 'label') {
          this.$set(this.metadata.labels, obj.key, obj.value);
        } else if (type === 'annotation') {
          this.$set(this.metadata.annotations, obj.key, obj.value);
        }
      },
    },
  };
</script>
