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
    <BaseBreadcrumb />

    <v-row class="kubegems__h-24 mt-0">
      <v-col class="pt-0" cols="4">
        <ValueCard
          :compare-value="alert ? alert.total.yesterdayCount : 0"
          icon="mdi-bell"
          :name="$t('tip.today_alert')"
          :value="alert ? alert.total.todayCount : 0"
        />
      </v-col>
      <v-col class="pt-0" cols="4">
        <ValueCard
          :compare-value="alert ? alert.resolved.yesterdayCount : 0"
          icon="mdi-fire-extinguisher"
          :name="$t('tip.cleared')"
          :value="alert ? alert.resolved.todayCount : 0"
        />
      </v-col>
      <v-col class="pt-0" cols="4">
        <ValueCard
          :compare-value="alert ? alert.firing.yesterdayCount : 0"
          icon="mdi-fire-alert"
          :name="$t('tip.triggering')"
          :value="alert ? alert.firing.todayCount : 0"
        />
      </v-col>
      <v-col class="pt-0" cols="12">
        <AlertHistoryBar :tenant="tenant" />
      </v-col>
      <v-col class="pt-0" cols="6">
        <AlertCategoryBar :tenant="tenant" />
      </v-col>
      <v-col class="pt-0" cols="6">
        <AlertTopBar :tenant="tenant" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import messages from '../i18n';
  import AlertCategoryBar from './components/AlertCategoryBar';
  import AlertHistoryBar from './components/AlertHistoryBar';
  import AlertTopBar from './components/AlertTopBar';
  import ValueCard from './components/ValueCard';
  import { getAlertToday } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ObserveMonitor',
    i18n: {
      messages: messages,
    },
    components: {
      AlertCategoryBar,
      AlertHistoryBar,
      AlertTopBar,
      ValueCard,
    },
    mixins: [BaseSelect],
    data() {
      return {
        tenant: null,
        alert: null,
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      ...mapState(['AdminViewport']),
    },
    watch: {
      tenant: {
        handler: function () {
          this.alertTodayMetrics();
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        if (!this.Tenant().ID) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_tenant'),
            color: 'warning',
          });
          return;
        }
        this.tenant = this.Tenant();
      });
    },
    methods: {
      async alertTodayMetrics() {
        this.alert = await getAlertToday(this.tenant.ID);
      },
    },
  };
</script>
