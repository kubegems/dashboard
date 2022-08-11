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
  <v-container fluid>
    <v-card class="mt-8" flat height="400px">
      <v-row class="row-height">
        <v-col class="d-none d-md-flex align-center justify-center">
          <div class="d-none d-sm-block">
            <div class="d-flex align-center pa-10">
              <div class="text-center">
                <h2 class="text-h4 primary--text font-weight-medium"> {{ $t('status.403') }} </h2>
                <h6 class="text-subtitle-1 mt-4 primary--text op-5 font-weight-regular">
                  {{ $t('tip.permission') }}
                </h6>
                <v-btn color="info mt-4" @click="toDashboard">
                  <v-icon left> mdi-undo-variant </v-icon>
                  {{ $root.$t('operate.return') }}
                </v-btn>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex';

  import messages from './i18n';

  export default {
    name: 'V403',
    i18n: {
      messages: messages,
    },
    computed: {
      ...mapGetters(['Tenant']),
    },
    methods: {
      toDashboard() {
        this.$store.commit('SET_ADMIN_VIEWPORT', false);
        this.$router.push({
          name: 'resource-dashboard',
          params: { tenant: this.Tenant().TenantName },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .row-height {
    height: 400px;
  }
</style>
