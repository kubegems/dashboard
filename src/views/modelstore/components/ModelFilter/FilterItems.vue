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
    <div class="filter__title text-subtitle-2">{{ title }}</div>
    <div>
      <v-text-field
        v-if="state.searchShow"
        v-model="search"
        class="mr-4 my-2 ml-2"
        dense
        flat
        hide-details
        :label="`${title}${i18nLocal.t('tip.name')}`"
        prepend-inner-icon="mdi-magnify"
        solo
        @keyup="searched"
      />

      <v-chip v-if="tagHide" class="ml-3 my-1 kubegems__pointer" color="primary" small @click="clearSelect">
        <v-avatar v-if="title !== 'Framework' || hasLogo(tagHide)" left>
          <BaseLogo
            class="filter__logo"
            :default-logo="title.toLowerCase()"
            :icon-name="getLogo(tagHide)"
            :ml="0"
            :width="18"
          />
        </v-avatar>
        {{ tagHide }}
      </v-chip>
      <v-chip-group v-model="tagIndex" active-class="primary" class="px-3" column @change="tagChanged">
        <v-chip v-for="tag in state.searchShow ? tagsCopy : shortTags" :key="tag" class="my-1" small>
          <v-avatar v-if="title !== 'Framework' || hasLogo(tag)" left>
            <BaseLogo
              class="filter__logo"
              :default-logo="title.toLowerCase()"
              :icon-name="getLogo(tag)"
              :ml="0"
              :width="18"
            />
          </v-avatar>
          {{ tag }}
        </v-chip>
      </v-chip-group>
      <v-chip
        v-if="orderedTags && orderedTags.length > 12"
        color="primary mx-3"
        small
        @click="state.searchShow = !state.searchShow"
      >
        <span v-if="state.searchShow">
          <v-icon small>mdi-chevron-double-up</v-icon>
        </span>
        <span v-else> + {{ orderedTags.length - 12 }}</span>
      </v-chip>
    </div>
    <div v-if="!tags || (orderedTags && orderedTags.length === 0)" class="filter__null">
      {{ i18n.t('data.no_data') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ComputedRef, computed, reactive, ref, watch } from 'vue';

  import { useI18n } from '../../i18n';
  import { MODEL_FRAMEWORK } from '@/constants/resource';
  import { useGlobalI18n } from '@/i18n';
  import { useQuery } from '@/router';
  import { deepCopy } from '@/utils/helpers';

  const props = withDefaults(
    defineProps<{
      title?: string;
      tags?: string[];
    }>(),
    {
      title: '',
      tags: undefined,
    },
  );

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const query = useQuery();
  const state = reactive({
    searchShow: false,
  });

  const search = ref<string>('');
  const tagsCopy = ref<string[]>([]);
  const orderedTags = ref<string[]>([]);
  const tagIndex = ref<number>(undefined);
  const tagHide = ref('');
  const orderIndex = ['pytorch', 'tensorflow', 'transformers', 'onnx'];

  const shortTags: ComputedRef<string[]> = computed(() => {
    return orderedTags.value.slice(0, 12);
  });

  const searched = (): void => {
    if (search.value) {
      tagsCopy.value = orderedTags.value.filter((t) => {
        return t.toLowerCase().indexOf(search.value.toLowerCase()) > -1;
      });
    } else {
      tagsCopy.value = deepCopy(orderedTags.value.slice(0, 100));
    }
  };

  const emit = defineEmits(['search']);
  const tagChanged = (): void => {
    const t = tagsCopy.value[tagIndex.value];
    const index = orderedTags.value.indexOf(t);
    if (index && index >= 12) {
      tagHide.value = orderedTags.value[index];
      tagIndex.value = -1;
    } else {
      tagHide.value = '';
    }

    emit('search', { [props.title.toLowerCase()]: index > -1 ? orderedTags.value[index] : null });
  };

  const clearSelect = (): void => {
    tagIndex.value = -1;
    tagChanged();
  };

  const getLogo = (tag: string): string => {
    if (props.title === 'Tags') {
      return 'tag';
    }
    if (props.title === 'License') {
      return 'license';
    }
    return tag;
  };

  const hasLogo = (tag: string): boolean => {
    return MODEL_FRAMEWORK.some((i) => {
      return tag.toLowerCase().indexOf(i) > -1;
    });
  };

  watch(
    () => props.tags,
    async (newValue) => {
      if (!newValue) return;
      orderedTags.value = [];
      newValue.forEach((t) => {
        const index = orderIndex.findIndex((i) => {
          return t.indexOf(i) > -1;
        });
        if (index > -1) {
          orderedTags.value.splice(index, 0, t);
        } else {
          orderedTags.value.push(t);
        }
      });
      tagsCopy.value = deepCopy(orderedTags.value.slice(0, 100));
      const tag = query.value.tags;
      const index = orderedTags.value.findIndex((t) => {
        return t === tag;
      });
      if (index > -1) {
        tagHide.value = tag;
        tagIndex.value = tagsCopy.value.indexOf(tag);
      }
    },
    { immediate: true, deep: true },
  );
</script>

<style lang="scss" scoped>
  .filter {
    &__title {
      font-size: 16px;
      margin-left: 12px;
      margin-top: 12px;
    }

    &__null {
      text-align: center;
      height: 130px;
      line-height: 130px;
    }

    &__logo {
      margin-top: 2px;
    }
  }
</style>
