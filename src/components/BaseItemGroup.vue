<!-- 
  Copyright 2022 The kubegems.io Authors

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License. 
-->

<template>
  <v-list-group
    v-model="open"
    :prepend-icon="item.meta.icon"
    :sub-group="subGroup"
    :active-class="`primary white--text`"
  >
    <template #activator>
      <v-list-item-icon v-if="item.meta.sicon" class="sicon">
        <v-icon v-text="item.meta.sicon" />
      </v-list-item-icon>

      <v-list-item-content>
        <v-list-item-title v-text="item.meta.title" />
      </v-list-item-content>
    </template>

    <template v-for="(child, i) in children">
      <BaseItemSubGroup v-if="child.children" :key="`sub-group-${i}`" :item="child" class="second-dd" />

      <BaseItem
        v-else-if="child.meta.show || (pluginPass(child.meta.dependencies) && child.meta.pluginOpenShow)"
        :key="`item-${i}`"
        :item="child"
        text
      />
    </template>
  </v-list-group>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BaseItemGroup',

    inheritAttrs: false,

    props: {
      item: {
        type: Object,
        default: () => ({
          avatar: undefined,
          group: undefined,
          title: undefined,
          children: [],
        }),
      },
      subGroup: {
        type: Boolean,
        default: false,
      },
      text: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      ...mapState(['Plugins']),
      children() {
        return this.item.children
          .filter((item) => {
            return (
              (!item.children &&
                (item.meta.show || (this.pluginPass(item.meta.dependencies) && item.meta.pluginOpenShow))) ||
              item.children
            );
          })
          .map((item) => ({
            ...item,
            to: this.$router.resolve({ name: item.name, params: { ...this.$route.params } }).href,
          }));
      },
      open: {
        get() {
          return this.genGroup(this.item.children);
        },
        set(val) {},
      },
    },

    methods: {
      genGroup(children) {
        return (
          children
            .map((item) => {
              let group = `${item.name}`;

              if (item.children) {
                group = `${group}|${this.genGroup(item.children)}`;
              }
              return group;
            })
            .indexOf(this.$route.name) > -1
        );
      },
      pluginPass(dependencies) {
        let pass = true;
        if (dependencies === undefined) return pass;
        dependencies.forEach((d) => {
          if (!this.Plugins[d]) {
            pass = false;
            return;
          }
        });
        return pass;
      },
    },
  };
</script>
