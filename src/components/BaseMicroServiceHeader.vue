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
  <v-card class="rounded-tr-0 rounded-tl-0 mb-3" flat height="60">
    <v-card-title class="py-3 mt-n3" :style="{ height: `60px` }">
      <v-sheet v-if="selectable" class="text-subtitle-1">
        {{ $t('resource.mesh') }}
        <v-menu
          v-model="virtualSpaceMenu"
          bottom
          content-class="micro-service-header__bg"
          left
          max-height="300px"
          max-width="220px"
          min-width="120px"
          nudge-bottom="5px"
          offset-y
          origin="top center"
          transition="scale-transition"
        >
          <template #activator="{ on }">
            <v-btn
              class="primary--text text-subtitle-1 font-weight-medium mt-n1"
              color="white"
              dark
              depressed
              small
              v-on="on"
              @click.stop="getVirtualspace"
            >
              <v-icon left>mdi-arrow-decision</v-icon>
              {{ VirtualSpace().VirtualSpaceName }}
              <v-icon v-if="virtualSpaceMenu" right>mdi-chevron-up</v-icon>
              <v-icon v-else right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-data-iterator
            hide-default-footer
            :items="[{ text: $t('resource.mesh'), values: m_select_virtualSpaceItems }]"
          >
            <template #no-data>
              <v-card>
                <v-card-text> {{ $t('data.no_data') }} </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text" flat :loading="loading">
                <v-list class="pb-3" dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>{{ $t('resource.mesh') }}</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <div class="header__list px-2">
                    <v-list-item
                      v-for="(virtualspace, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center font-weight-medium px-2"
                      link
                      :style="{
                        color: virtualspace.text === VirtualSpace().VirtualSpaceName ? `#1e88e5 !important` : ``,
                      }"
                      @click="setVirtualSpace(virtualspace)"
                    >
                      <v-list-item-content class="text-body-2 font-weight-medium text-start">
                        <div class="kubegems__break-all">
                          <v-icon color="primary" left small>mdi-arrow-decision</v-icon>
                          {{ virtualspace.text }}
                        </div>
                      </v-list-item-content>
                    </v-list-item>
                  </div>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
      <template v-else>
        <v-sheet class="text-subtitle-1">
          {{ $t('resource.mesh') }}
          <v-btn
            class="primary--text text-subtitle-1 font-weight-medium mt-n1"
            color="white"
            dark
            depressed
            small
            @click.stop
          >
            <v-icon left>mdi-arrow-decision</v-icon>
            {{ VirtualSpace().VirtualSpaceName }}
          </v-btn>
        </v-sheet>
        <v-sheet class="text-subtitle-1 ml-4">
          {{ $t('resource.cluster') }}
          <v-btn
            class="primary--text text-subtitle-1 font-weight-medium mt-n1"
            color="white"
            dark
            depressed
            small
            @click.stop
          >
            <v-icon left>mdi-kubernetes</v-icon>
            {{ $route.query.cluster }}
          </v-btn>
        </v-sheet>
        <v-sheet class="text-subtitle-1 ml-4">
          {{ $t('resource.environment') }}
          <v-btn
            class="primary--text text-subtitle-1 font-weight-medium mt-n1"
            color="white"
            dark
            depressed
            small
            @click.stop
          >
            <v-icon left>mdi-cloud</v-icon>
            {{ $route.query.environment }}
          </v-btn>
        </v-sheet>
      </template>

      <v-spacer />

      <v-sheet>
        <span class="text-body-2 kubegems__text">
          {{ $t('resource.mesh_c', [$t('resource.role')]) }}:
          {{
            $VIRTUALSPACE_ROLE[m_permisson_virtualSpaceRole]
              ? $t(`role.mesh.${m_permisson_virtualSpaceRole}`)
              : $t('data.unknown')
          }}
        </span>
        <v-btn class="primary--text" small text @click="returnVirtualSpace">
          <v-icon left small>mdi-logout</v-icon>
          {{ $t('operate.return') }}
        </v-btn>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex';

  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'BaseMicroServiceHeader',
    mixins: [BasePermission, BaseResource, BaseSelect],
    inject: ['reload'],
    props: {
      selectable: {
        type: Boolean,
        default: () => true,
      },
    },
    data: () => ({
      virtualSpaceMenu: false,
      loading: false,
    }),
    computed: {
      ...mapGetters(['VirtualSpace']),
    },
    methods: {
      async setVirtualSpace(item) {
        this.$store.commit('SET_NAMESPACE_FILTER', null);
        this.$store.commit('SET_ENVIRONMENT_FILTER', null);
        await this.$store.dispatch('UPDATE_VIRTUALSPACE_DATA');
        await this.$router.replace({
          params: { virtualspace: item.text },
        });
        this.reload();
      },
      returnVirtualSpace() {
        this.$store.commit('CLEAR_VIRTUAL_SPACE');
        this.$store.commit('SET_NAMESPACE_FILTER', null);
        this.$store.commit('SET_ENVIRONMENT_FILTER', null);
        this.$router.push({
          name: 'virtualspace-list',
        });
      },
      async getVirtualspace() {
        this.loading = true;
        await this.m_select_virtualSpaceSelectData();
        this.loading = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .micro-service-header__bg {
    z-index: auto !important;
  }

  .header__list {
    max-height: 250px;
    overflow-y: auto;
  }
</style>
