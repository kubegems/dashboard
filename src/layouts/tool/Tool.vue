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
  <v-menu
    v-if="Admin"
    content-class="kubegems__tool-card-menu"
    left
    min-width="350px"
    offset-y
    origin="bottom right"
    top
    transition="scale-transition"
  >
    <template #activator="{ on, attrs }">
      <v-btn bottom v-bind="attrs" class="tool__btn" color="primary" dark fab fixed right small v-on="on">
        <v-icon small>fas fa-wrench</v-icon>
      </v-btn>
    </template>
    <v-card class="pa-0" flat>
      <BaseSubTitle :divider="false" title="工具箱" />
      <v-card-text class="px-2 pt-0 pb-2">
        <v-card v-if="Admin" class="my-2 pa-2" flat hover outlined @click="toAdminViewport">
          <v-card-text class="pa-1">
            <v-flex class="float-left">
              <v-icon color="primary" left small> fas fa-cog </v-icon>
            </v-flex>
            <v-flex class="text-subtitle-2 primary--text">平台管理</v-flex>
            <v-flex class="text-caption"> 以管理员身份查看操作所有资源。 </v-flex>
            <div class="kubegems__clear-float" />
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>
  </v-menu>
</template>
<script>
  import { mapGetters, mapState } from 'vuex';

  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'Tool',
    mixins: [BaseResource, BaseSelect],
    inject: ['reload'],
    computed: {
      ...mapState(['Admin']),
      ...mapGetters(['Tenant', 'Cluster']),
    },
    methods: {
      async toAdminViewport() {
        this.$store.commit('CLEAR_VIRTUAL_SPACE');
        this.$store.commit('CLEAR_PLUGINS_INTERVAL');
        this.$store.commit('SET_ADMIN_VIEWPORT', true);
        if (this.Cluster().ID === 0) {
          await this.$store.dispatch('UPDATE_CLUSTER_DATA');
        }
        this.$router.push({
          name: 'cluster-center',
          params: { cluster: this.Cluster().ClusterName },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .tool {
    &__btn {
      bottom: 20px;
      right: 20px;
      z-index: 15;
      height: 45px;
      width: 45px;
      border-radius: 45px;
    }
  }
</style>
