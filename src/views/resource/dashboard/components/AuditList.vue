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
  <v-card>
    <BaseSubTitle class="pt-2" :divider="false" :title="$t('audit.audit')">
      <template #action>
        <v-btn class="float-right mr-2" color="primary" small text @click="toAudit">
          <v-icon left small> mdi-more </v-icon>
          {{ $t('more') }}
        </v-btn>
      </template>
    </BaseSubTitle>
    <v-card-text>
      <v-flex v-if="auditItems.length === 0" :style="{ position: 'relative', height: '300px' }">
        <span class="kubegems__full-center kubegems__text"> {{ $root.$t('data.no_data') }} </span>
      </v-flex>
      <div class="align-items-center">
        <div class="vs-scrollable">
          <div v-for="(item, index) in auditItems" :key="index" class="comment-widgets position-relative">
            <div class="d-flex flex-row comment-row mt-0 py-1">
              <div class="pa-2">
                <v-avatar color="success" size="45">
                  <span class="white--text text-h6">
                    {{ item.Username ? item.Username[0].toLocaleUpperCase() : 'N' }}
                  </span>
                </v-avatar>
              </div>
              <div class="comment-text pl-5">
                <h3 class="font-weight-regular mb-2">
                  {{ item.Username }}
                </h3>
                <span class="d-block my-0 text-subtitle-2 font-weight-regular break-all">
                  {{ item.Action }}{{ item.Module }}
                </span>
                <div class="comment-footer">
                  <span class="text-muted mr-2">
                    {{ item.CreatedAt ? $moment(item.CreatedAt, 'YYYY-MM-DDTHH:mm:ssZ').fromNow() : '' }}
                  </span>
                  <v-chip
                    class="mx-1 white--text status-chip"
                    :color="item.Success ? 'success' : 'red lighten-2'"
                    label
                    x-small
                  >
                    <v-icon left x-small>
                      {{ item.Success ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                    {{ item.Success ? $root.$t('status.success') : $root.$t('status.failure') }}
                  </v-chip>
                </div>
              </div>
            </div>
            <v-divider class="mb-2 mt-2" />
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import { getAuditList } from '@/api';

  export default {
    name: 'AuditList',
    i18n: {
      messages: messages,
    },
    data: () => ({
      auditItems: [],
    }),
    computed: {
      ...mapState(['JWT', 'Admin']),
      ...mapGetters(['Tenant']),
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (this.Tenant().ID > 0) {
            this.auditList();
          }
        });
      }
    },
    methods: {
      async auditList() {
        const data = await getAuditList({
          size: 5,
          Tenant: this.Tenant().TenantName,
          order: '-CreatedAt',
          noprocessing: true,
        });
        this.auditItems = data.List;
      },
      toAudit() {
        this.$router.push({
          name: 'audit-list',
          params: Object.assign(this.$route.params, {
            tenant: this.Tenant().TenantName,
          }),
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .status-chip {
    max-width: 250px;
    word-break: break-all;
    white-space: initial;
    height: auto;
  }
</style>
