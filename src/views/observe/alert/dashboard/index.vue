<template>
  <v-container fluid>
    <BaseBreadcrumb />

    <v-row class="kubegems__h-24 mt-0">
      <v-col class="pt-0" cols="4">
        <ValueCard
          :compare-value="alert ? alert.total.yesterdayCount : 0"
          icon="mdi-bell"
          name="今日告警"
          :value="alert ? alert.total.todayCount : 0"
        />
      </v-col>
      <v-col class="pt-0" cols="4">
        <ValueCard
          :compare-value="alert ? alert.resolved.yesterdayCount : 0"
          icon="mdi-fire-extinguisher"
          name="已消除"
          :value="alert ? alert.resolved.todayCount : 0"
        />
      </v-col>
      <v-col class="pt-0" cols="4">
        <ValueCard
          :compare-value="alert ? alert.firing.yesterdayCount : 0"
          icon="mdi-fire-alert"
          name="正在告警"
          :value="alert ? alert.firing.todayCount : 0"
        />
      </v-col>
      <v-col class="pt-0" cols="12">
        <AlertHistoryLine :tenant="tenant" />
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
  import { mapState, mapGetters } from 'vuex';

  import AlertCategoryBar from './components/AlertCategoryBar';
  import AlertHistoryLine from './components/AlertHistoryLine';
  import AlertTopBar from './components/AlertTopBar';
  import ValueCard from './components/ValueCard';
  import { getAlertToday } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ObserveMonitor',
    components: {
      AlertCategoryBar,
      AlertHistoryLine,
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
            text: '暂未选择租户',
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
