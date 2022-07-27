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
  <v-list-item
    :active-class="``"
    :href="href"
    :rel="href && href !== '#' ? 'noopener' : undefined"
    :target="href && href !== '#' ? '_blank' : undefined"
    :to="item.to"
  >
    <v-list-item-icon v-if="item.meta.icon">
      <v-icon v-text="item.meta.icon" />
    </v-list-item-icon>

    <v-list-item-content v-if="item.meta.title">
      <v-list-item-title v-text="item.meta.title" />
    </v-list-item-content>
  </v-list-item>
</template>

<script>
  import Themeable from 'vuetify/lib/mixins/themeable';

  export default {
    name: 'BaseItem',
    mixins: [Themeable],
    props: {
      item: {
        type: Object,
        default: () => ({
          href: undefined,
          icon: undefined,
          title: undefined,
          to: undefined,
        }),
      },
    },
    computed: {
      href() {
        return this.item.href || (!this.item.to ? '#' : undefined);
      },
    },
  };
</script>
