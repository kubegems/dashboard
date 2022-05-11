<template>
  <v-container fluid>
    <BaseBreadcrumb>
      <template
        v-if="AdminViewport"
        #extend
      >
        <TenantSelect v-model="tenant" />
      </template>
    </BaseBreadcrumb>
    <IntroSteps />
    <OverviewList
      class="mt-4"
      :tenant="tenant"
    />
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import IntroSteps from './components/IntroSteps'
import OverviewList from './components/OverviewList'
import TenantSelect from '../components/TenantSelect'

export default {
  name: 'Observe',
  components: {
    IntroSteps,
    OverviewList,
    TenantSelect,
  },
  data () {
    return {
      tenant: null,
    }
  },
  computed: {
    ...mapGetters(['Tenant']),
    ...mapState(['AdminViewport']),
  },
  mounted() {
    this.$nextTick(() => {
      if (!this.AdminViewport) {
        this.tenant = this.Tenant()
      }
    })
  },
  methods: {

  },
}
</script>
