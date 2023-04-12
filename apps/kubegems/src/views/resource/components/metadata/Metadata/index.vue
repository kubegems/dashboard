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
          <div v-for="(value, key) in metadata ? metadata.labels : []" :key="key" class="mr-2 my-1">
            <div class="success white--text float-left metadata__left text-caption">
              <div class="primary pl-2 pr-1 metadata__front">
                <v-icon color="white" small> mdi-label </v-icon>
                <strong class="mr-1"> {{ key }} </strong>
              </div>
            </div>
            <div class="success white--text float-left metadata__right text-caption px-2">
              <strong>{{ value }}</strong>
              <v-btn v-if="!readonly" color="white" icon x-small @click="removeMetadata(key, 'label')">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </div>
            <div class="kubegems__clear-float" />
          </div>
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
          <div v-for="(value, key) in metadata ? metadata.annotations : []" :key="key" class="mr-2 my-1">
            <template v-if="ANNOTATION_IGNORE_ARRAY.indexOf(key) === -1">
              <div class="success white--text float-left metadata__left text-caption">
                <div class="primary pl-2 pr-1 metadata__front">
                  <v-icon color="white" small> mdi-label </v-icon>
                  <strong class="mr-1"> {{ key }} </strong>
                </div>
              </div>
              <div class="success white--text float-left metadata__right text-caption px-2">
                <strong>{{ value }}</strong>
                <v-btn v-if="!readonly" color="white" icon x-small @click="removeMetadata(key, 'annotation')">
                  <v-icon small>mdi-delete</v-icon>
                </v-btn>
              </div>
              <div class="kubegems__clear-float" />
            </template>
          </div>
        </v-flex>
      </v-flex>
    </v-card>

    <AddLabel v-if="!readonly" ref="addLabel" :item="item" @refresh="refreshMetadata" />
    <AddAnnotation v-if="!readonly" ref="addAnnotation" :item="item" @refresh="refreshMetadata" />
  </div>
</template>
<script>
  import { patchMetadataNode } from '@kubegems/api/direct';
  import { ANNOTATION_IGNORE_ARRAY } from '@kubegems/libs/constants/resource';
  import { deepCopy } from '@kubegems/libs/utils/helpers';
  import BaseResource from '@kubegems/mixins/resource';
  import { mapGetters, mapState } from 'vuex';

  import messages from '../../i18n';
  import AddAnnotation from './AddAnnotation';
  import AddLabel from './AddLabel';

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
      this.ANNOTATION_IGNORE_ARRAY = ANNOTATION_IGNORE_ARRAY;

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

<style lang="scss" scoped>
  .metadata {
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
