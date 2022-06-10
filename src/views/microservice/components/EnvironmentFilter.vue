<template>
  <v-sheet>
    <v-sheet>
      <v-sheet :class="`text-subtitle-2 ml-${ml} mt-2 float-left kubegems__text font-weight-medium`">
        应用环境
      </v-sheet>
      <v-sheet class="float-left" width="350">
        <v-combobox
          v-model="environmentFilter"
          color="primary"
          chips
          hide-selected
          hide-details
          label="应用环境"
          prepend-inner-icon="mdi-cube"
          dense
          solo
          flat
          no-data-text="无数据"
          full-width
          class="ml-2"
          :items="m_select_virtualSpaceEnvironmentItems"
          @change="onEnvironmentFilterChange"
        >
          <template #selection="{ attrs, item, selected }">
            <v-chip v-if="environmentFilter" :input-value="selected" color="primary" label small v-bind="attrs">
              <span class="pr-2">{{ item.text }}</span>
            </v-chip>
          </template>
        </v-combobox>
      </v-sheet>
      <div class="kubegems__clear-float" />
    </v-sheet>
    <div class="kubegems__clear-float" />
  </v-sheet>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'EnvironmentFilter',
    mixins: [BaseSelect],
    inject: ['reload'],
    props: {
      ml: {
        type: Number,
        default: () => 4,
      },
    },
    data() {
      return {
        environmentFilter: null,
      };
    },
    computed: {
      ...mapState(['NamespaceFilter', 'EnvironmentFilter']),
      ...mapGetters(['VirtualSpace']),
      Environment() {
        if (!this.environmentFilter) return {};
        const env = this.m_select_virtualSpaceEnvironmentItems.find((e) => {
          return e.value === this.environmentFilter.value;
        });
        if (env) return env;
        return {};
      },
      EnvironmentFormNS() {
        const env = this.m_select_virtualSpaceEnvironmentItems.find((e) => {
          return this.NamespaceFilter && e.namespace === this.NamespaceFilter.Namespace;
        });
        if (env) return env;
        return {};
      },
    },
    async mounted() {
      await this.m_select_virtualSpaceEnvironmentSelectData(this.VirtualSpace().ID);
      if (!this.NamespaceFilter) {
        if (this.$route.query.namespace) {
          this.$store.commit('SET_NAMESPACE_FILTER', {
            Namespace: this.$route.query.namespace,
            Mounted: true,
          });
          this.$store.commit('SET_ENVIRONMENT_FILTER', this.EnvironmentFormNS);
        } else if (this.m_select_virtualSpaceEnvironmentItems.length > 0) {
          const env = this.m_select_virtualSpaceEnvironmentItems[0];
          this.$store.commit('SET_NAMESPACE_FILTER', {
            Namespace: env.namespace,
            Mounted: true,
          });
          this.$store.commit('SET_ENVIRONMENT_FILTER', env);
        }
      }
      this.$router.replace({
        query: {
          ...this.$route.query,
          ...{
            namespace: this.NamespaceFilter ? this.NamespaceFilter.Namespace : '',
            environmentid: this.EnvironmentFormNS.value,
            clusterid: this.EnvironmentFormNS.clusterid,
            page: 1,
            cluster: this.EnvironmentFormNS.cluster,
          },
        },
      });
      if (this.NamespaceFilter) {
        this.environmentFilter = {
          text: this.EnvironmentFormNS.text,
          value: this.EnvironmentFormNS.value,
        };
      }
    },
    methods: {
      onEnvironmentFilterChange() {
        const namespace = this.Environment.namespace;
        if (namespace) {
          this.$store.commit('SET_NAMESPACE_FILTER', {
            Namespace: namespace,
            Mounted: false,
          });
          this.$store.commit('SET_ENVIRONMENT_FILTER', this.Environment);
          this.$router.replace({
            query: {
              ...this.$route.query,
              ...{
                namespace: namespace,
                environmentid: this.Environment.value,
                clusterid: this.Environment.clusterid,
                cluster: this.Environment.cluster,
              },
              ...{ page: 1 },
            },
          });
        } else {
          this.environmentFilter = null;
          this.$store.commit('SET_SNACKBAR', {
            text: `请选择应用环境`,
            color: 'warning',
          });
        }
      },
    },
  };
</script>
