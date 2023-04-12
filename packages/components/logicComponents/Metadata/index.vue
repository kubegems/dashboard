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
      <BaseSubTitle class="pt-2" :divider="false" :title="i18nLocal.t('tip.label')">
        <template v-if="!readonly" #action>
          <v-btn class="float-right mr-2" color="primary" small text @click="addLabel">
            <v-icon left small> mdi-tag-plus </v-icon>
            {{ i18n.t('operate.add_c', [i18nLocal.t('tip.label')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-flex class="px-4">
        <v-flex class="pb-4">
          <div v-for="(value, key) in node.metadata ? node.metadata.labels : []" :key="key" class="mr-2 my-1">
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
      <BaseSubTitle class="pt-2" :divider="false" :title="i18nLocal.t('tip.annotation')">
        <template v-if="!readonly" #action>
          <v-btn class="float-right mr-2" color="primary" small text @click="addAnnotation">
            <v-icon left small> mdi-tag-plus </v-icon>
            {{ i18n.t('operate.add_c', [i18nLocal.t('tip.annotation')]) }}
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-flex class="px-4 pb-4">
        <v-flex>
          <div v-for="(value, key) in node.metadata ? node.metadata.annotations : []" :key="key" class="mr-2 my-1">
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

    <AddLabel v-if="!readonly" ref="label" :item="item" @refresh="refreshMetadata" />
    <AddAnnotation v-if="!readonly" ref="annotation" :item="item" @refresh="refreshMetadata" />
  </div>
</template>

<script lang="ts" setup>
  import { Node } from '@kubegems/api/typed/node';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useCluster } from '@kubegems/extension/resource';
  import { useStore } from '@kubegems/extension/store';
  import { ANNOTATION_IGNORE_ARRAY } from '@kubegems/libs/constants/resource';
  import { ref, watch } from 'vue';

  import { useI18n } from '../i18n';
  import AddAnnotation from './AddAnnotation.vue';
  import AddLabel from './AddLabel.vue';

  const props = withDefaults(
    defineProps<{
      item?: Node;
      readonly?: boolean;
    }>(),
    {
      item: undefined,
      readonly: true,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const node = ref<Node>(new Node());
  const removeMetadata = (item: any, type: string): void => {
    store.commit('SET_CONFIRM', {
      title:
        type === 'label'
          ? i18n.t('operate.delete_c', [i18nLocal.t('tip.label')])
          : i18n.t('operate.delete_c', [i18nLocal.t('tip.annotation')]),
      content: {
        text:
          type === 'label'
            ? `${i18n.t('operate.delete_c', [i18nLocal.t('tip.label')])} ${item}`
            : `${i18n.t('operate.delete_c', [i18nLocal.t('tip.annotation')])} ${item}`,
        type: 'delete',
        name: item,
      },
      param: { item, type },
      doFunc: async (param) => {
        if (param.type === 'label') {
          delete node.value.metadata.labels[param.item];
        } else if (param.type === 'annotation') {
          delete node.value.metadata.annotations[param.item];
        }
        await new Node(node.value).metaNode(useCluster());
      },
    });
  };

  const label = ref(null);
  const addLabel = () => {
    label.value.open();
  };

  const annotation = ref(null);
  const addAnnotation = () => {
    annotation.value.open();
  };

  const refreshMetadata = (obj: { key: string; value: string }, type: string): void => {
    if (type === 'label') {
      node.value.metadata.labels[obj.key] = obj.value;
    } else if (type === 'annotation') {
      node.value.metadata.annotations[obj.key] = obj.value;
    }
  };

  watch(
    () => props.item,
    async (newValue) => {
      if (!newValue) return;
      node.value = newValue;
    },
    {
      immediate: true,
      deep: true,
    },
  );
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
