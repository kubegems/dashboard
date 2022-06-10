<template>
  <v-container fluid>
    <BaseBreadcrumb />
    <IntroSteps />
    <OverviewList class="mt-3" :tenant="tenant" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import IntroSteps from './components/IntroSteps';
  import OverviewList from './components/OverviewList';

  export default {
    name: 'Observe',
    components: {
      IntroSteps,
      OverviewList,
    },
    data() {
      return {
        tenant: null,
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
      ...mapState(['AdminViewport']),
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
    methods: {},
  };
</script>
