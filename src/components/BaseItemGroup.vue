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
  <v-list-group
    v-model="open"
    :active-class="`primary white--text`"
    :prepend-icon="item.meta.icon"
    :sub-group="subGroup"
  >
    <template #activator>
      <v-list-item-icon v-if="item.meta.sicon" class="sicon">
        <v-icon v-text="item.meta.sicon" />
      </v-list-item-icon>

      <v-list-item-content>
        <v-list-item-title v-text="$t(item.meta.title)" />
      </v-list-item-content>
    </template>

    <template v-for="(child, i) in children">
      <BaseItemSubGroup v-if="child.children" :key="`sub-group-${i}`" class="second-dd" :item="child" />

      <BaseItem
        v-else-if="
          !child.children && (child.meta.show || (pluginPass(child.meta.dependencies) && child.meta.pluginOpenShow))
        "
        :key="`item-${i}`"
        :item="child"
        text
      />
    </template>
  </v-list-group>
</template>

<script lang="ts" setup inherit-attrs="false">
  import { ref, watch } from 'vue';

  import { useRouter } from '@/composition/router';
  import { useName, useParams } from '@/router';
  import { useStore } from '@/store';

  const store = useStore();
  const router = useRouter();

  type ItemGroup = {
    avatar: string;
    group: string;
    title: string;
    children: ItemGroup[];
    meta?: any;
    [key: string]: any;
  };

  const props = withDefaults(
    defineProps<{
      item?: ItemGroup;
      subGroup?: boolean;
    }>(),
    {
      item: (): ItemGroup => {
        return {
          avatar: undefined,
          group: undefined,
          title: undefined,
          children: [],
        };
      },
      subGroup: false,
    },
  );

  const genGroup = (children: ItemGroup[]): boolean => {
    return (
      children
        .map((item) => {
          let group = `${item.name}`;

          if (item.children) {
            group = `${group}|${genGroup(item.children)}`;
          }
          return group;
        })
        .indexOf(name.value) > -1
    );
  };

  let open = ref(false);
  const name = useName();
  watch(
    () => name,
    async (newValue) => {
      if (!newValue) return;
      open.value = genGroup(props.item.children);
    },
    {
      immediate: true,
      deep: true,
    },
  );

  const pluginPass = (dependencies: string[]): boolean => {
    let pass = true;
    if (dependencies === undefined) return pass;
    dependencies.forEach((d) => {
      if (!store.state.Plugins?.[d]) {
        pass = false;
        return;
      }
    });
    return pass;
  };

  const passEdge = (edge: string | boolean): boolean => {
    if (edge === undefined) return true;
    if (store.state.AdminViewport) {
      if (store.state.Edge) return Boolean(edge);
      return true;
    } else {
      if (store.state.Edge) return edge && store.getters.Environment().AllowEdgeRegistration;
      else return !Boolean(edge) || (edge === 'check' && store.getters.Environment().AllowEdgeRegistration);
    }
  };

  let children = ref<ItemGroup[]>([]);
  const params = useParams();
  watch(
    () => params,
    async (newValue) => {
      if (!newValue) return;
      children.value = props.item.children
        .filter((item) => {
          return (
            (!item.children &&
              (item.meta.show || (pluginPass(item.meta.dependencies) && item.meta.pluginOpenShow)) &&
              passEdge(item.meta.edge)) ||
            item.children
          );
        })
        .map((item) => ({
          ...item,
          to: router.resolve({ name: item.name, params: { ...newValue.value } }).href,
        }));
    },
    {
      immediate: true,
      deep: true,
    },
  );
</script>
