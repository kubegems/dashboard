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
        {{ $t('resource.project') }}
        <v-menu
          v-model="projectMenu"
          bottom
          content-class="tenant-header__bg"
          max-width="220px"
          min-width="120px"
          nudge-bottom="5px"
          offset-y
          origin="top center"
          right
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
              @click.stop="getProject"
            >
              <v-icon left>mdi-view-dashboard</v-icon>
              {{ Project().ProjectName }}
              <v-icon v-if="projectMenu" right>mdi-chevron-up</v-icon>
              <v-icon v-else right>mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-data-iterator
            hide-default-footer
            :items="[{ text: $t('resource.project'), values: m_select_tenantProjectItems }]"
          >
            <template #no-data>
              <v-card>
                <v-card-text> {{ $t('data.no_data') }} </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text" flat :loading="loadingPro">
                <v-list class="pb-3" dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>{{ $t('resource.project') }}</span>
                  </v-flex>
                  <v-divider class="mx-2" />
                  <div class="header__list px-2">
                    <v-list-item
                      v-for="(project, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center font-weight-medium px-2"
                      link
                      :style="{ color: project.text === Project().ProjectName ? `#1e88e5 !important` : `` }"
                      @click="setProject(project)"
                    >
                      <v-list-item-content class="text-body-2 font-weight-medium text-start">
                        <div class="kubegems__break-all">
                          <v-icon color="primary" left small>mdi-view-dashboard</v-icon>
                          {{ project.text }}
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
      <v-sheet v-else class="text-subtitle-1">
        {{ $t('resource.project') }}
        <v-btn
          class="primary--text text-subtitle-1 font-weight-medium mt-n1"
          color="white"
          dark
          depressed
          small
          @click.stop
        >
          <v-icon left>mdi-view-dashboard</v-icon>
          {{ Project().ProjectName }}
          <v-icon right @click.stop="toProject"> mdi-open-in-new </v-icon>
        </v-btn>
      </v-sheet>

      <template v-if="environmented">
        <v-sheet v-if="selectable" class="text-subtitle-1 ml-4">
          {{ $t('resource.environment') }}
          <v-menu
            v-model="environmentMenu"
            bottom
            content-class="z-index-bg"
            max-height="300px"
            max-width="220px"
            min-width="120px"
            nudge-bottom="5px"
            offset-y
            origin="top center"
            right
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
                @click.stop="getEnvironment"
              >
                <v-icon left>mdi-cloud</v-icon>
                {{ Environment().EnvironmentName }}
                <v-icon v-if="environmentMenu" right>mdi-chevron-up</v-icon>
                <v-icon v-else right>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-data-iterator
              hide-default-footer
              :items="[{ text: $t('resource.environment'), values: m_select_projectEnvironmentItems }]"
            >
              <template #no-data>
                <v-card>
                  <v-card-text> {{ $t('data.no_data') }} </v-card-text>
                </v-card>
              </template>
              <template #default="props">
                <v-card v-for="item in props.items" :key="item.text" flat :loading="loadingEnv">
                  <v-list class="pb-3" dense>
                    <v-flex class="text-subtitle-2 text-center ma-2">
                      <span>{{ $t('resource.environment') }}</span>
                    </v-flex>
                    <v-divider class="mx-2" />
                    <div class="header__list px-2">
                      <v-list-item
                        v-for="(environment, index) in item.values"
                        :key="index"
                        class="text-body-2 text-center font-weight-medium px-2"
                        link
                        :style="{
                          color: environment.text === Environment().EnvironmentName ? `#1e88e5 !important` : ``,
                        }"
                        @click="setEnvironment(environment)"
                      >
                        <v-list-item-content class="text-body-2 font-weight-medium text-start">
                          <div class="kubegems__break-all">
                            <v-icon color="primary" left small>mdi-cloud</v-icon>
                            {{ environment.text }}
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
        <v-sheet v-else class="text-subtitle-1 ml-4">
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
            {{ Environment().EnvironmentName }}
          </v-btn>
        </v-sheet>
      </template>

      <v-spacer />

      <v-sheet>
        <span v-if="environmented" class="text-body-2 kubegems__text">
          {{ $t('resource.project_c', [$t('resource.role')]) }}:
          {{
            $RESOURCE_ROLE[m_permisson_resourceRole]
              ? $t(`role.project.${m_permisson_resourceRole}`)
              : $t('data.unknown')
          }}
          <span class="ml-4">
            {{ $t('resource.environment_c', [$t('resource.type')]) }}:
            {{ $METATYPE_CN[Environment().Type] ? $t(`metadata.environment_type.${Environment().Type}`) : '' }}
          </span>
          <span class="ml-4">{{ $t('resource.cluster') }} : {{ Environment().ClusterName }}</span>
          <span class="ml-4">{{ $t('resource.namespace') }} : {{ Environment().Namespace }}</span>
        </span>
        <span v-else class="text-body-2 kubegems__text">
          {{ $t('resource.project_c', [$t('resource.role')]) }}:
          {{
            $PROJECT_ROLE[m_permisson_projectRole] ? $t(`role.project.${m_permisson_resourceRole}`) : $t('data.unknown')
          }}
        </span>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'BaseTenantHeader',
    mixins: [BasePermission, BaseResource, BaseSelect],
    inject: ['reload'],
    props: {
      environmented: {
        type: Boolean,
        default: () => true,
      },
      selectable: {
        type: Boolean,
        default: () => true,
      },
    },
    data: () => ({
      projectMenu: false,
      environmentMenu: false,
      loadingPro: false,
      loadingEnv: false,
    }),
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Project', 'Environment', 'Tenant']),
    },
    methods: {
      async setProject(item) {
        if (this.environmented) {
          await this.m_select_projectEnvironmentSelectData(item.value);
          if (this.m_select_projectEnvironmentItems.length === 0) {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$t('tip.project_select'),
              color: 'warning',
            });
            return;
          } else {
            const env = this.m_select_projectEnvironmentItems[0];
            await this.$router.replace({
              params: {
                tenant: this.Tenant().TenantName,
                project: item.text,
                environment: env.text,
              },
            });
          }
        } else {
          await this.$router.replace({
            params: {
              tenant: this.Tenant().TenantName,
              project: item.text,
            },
          });
        }
        this.reload();
      },
      async setEnvironment(item) {
        await this.$router.replace({
          params: {
            tenant: this.Tenant().TenantName,
            project: this.Project().ProjectName,
            environment: item.text,
          },
          query: {
            timestamp: Date.parse(new Date()),
          },
        });
        this.reload();
      },
      toProject() {
        this.$store.commit('CLEAR_RESOURCEIRONMENT');
        this.$router.push({
          name: 'project-detail',
          params: {
            name: this.Project().ProjectName,
            tenant: this.Tenant().TenantName,
            project: this.Project().ProjectName,
          },
        });
      },
      async getProject() {
        this.loadingPro = true;
        await this.m_select_tenantProjectSelectData();
        this.loadingPro = false;
      },
      async getEnvironment() {
        this.loadingEnv = true;
        await this.m_select_projectEnvironmentSelectData(this.Project().ID);
        this.loadingEnv = false;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .tenant-header__bg {
    z-index: auto !important;
  }

  .header {
    &__list {
      max-height: 250px;
      overflow-y: auto;
    }
  }
</style>
