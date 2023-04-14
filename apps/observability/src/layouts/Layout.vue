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
  <Layout>
    <template #header>
      <Header v-model="expandOnHover" small-title="可观测性" />
    </template>
    <template #sidebar>
      <Sidebar
        :key="store.state.SidebarKey"
        :expand-on-hover.sync="expandOnHover"
        :routes="useRoutes()"
        :sidebar-items="SIDEBAR_ITEMS"
      />
    </template>
  </Layout>
</template>

<script lang="ts" setup>
  import Layout from '@kubegems/components/layouts/Layout.vue';
  import Sidebar from '@kubegems/components/layouts/Sidebar.vue';
  import { useStore } from '@kubegems/extension/store';
  import { ref } from 'vue';

  import { useRoutes } from '../router';
  import { SIDEBAR_ITEMS } from '../sidebar';
  import Header from './header/Header.vue';

  const store = useStore();

  const expandOnHover = ref(false);
</script>
