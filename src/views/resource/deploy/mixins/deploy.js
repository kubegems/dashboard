import { mapGetters, mapState } from 'vuex';

import { getStrategyDeployEnvironmentAppsDetail } from '@/api';

const deploy = {
  data() {
    return {
      runtime: {},
    };
  },
  computed: {
    ...mapState(['Circular']),
    ...mapGetters(['Tenant', 'Project', 'Environment']),
  },
  methods: {
    async strategyDeployEnvironmentAppsDetail() {
      const data = await getStrategyDeployEnvironmentAppsDetail(
        this.Tenant().ID,
        this.Project().ID,
        this.Environment().ID,
        this.$route.params.name,
      );
      this.runtime = data;
    },
  },
};

export default deploy;
