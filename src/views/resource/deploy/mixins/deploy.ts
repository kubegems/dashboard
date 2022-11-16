import { mapGetters, mapState } from 'vuex';

import { getStrategyDeployEnvironmentAppsDetail } from 'src/api';

const deploy: { [key: string]: any } = {
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
    async strategyDeployEnvironmentAppsDetail(): Promise<void> {
      const data: { [key: string]: any } = await getStrategyDeployEnvironmentAppsDetail(
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
