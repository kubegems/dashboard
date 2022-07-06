<template>
  <div>
    <v-flex class="d-flex" :style="{ display: 'inline-flex !important' }">
      <ProjectEnvSelectCascade v-model="env" :tenant="Tenant()" />

      <v-sheet class="tip">
        <v-icon right small> fas fa-question-circle </v-icon>
      </v-sheet>

      <v-sheet class="text-body-2 ml-2" :style="{ lineHeight: '36px' }">
        <v-btn bottom color="primary" small text @click="handleRefresh"> 刷新 </v-btn>
      </v-sheet>

      <v-sheet class="text-body-2 ml-2" :style="{ lineHeight: '36px' }">
        <v-btn bottom color="error" small text @click="handleClear"> 清空 </v-btn>
      </v-sheet>

      <v-sheet v-if="loading" class="tip ml-2">
        <v-progress-circular color="primary" indeterminate size="20" :width="3" />
      </v-sheet>
    </v-flex>

    <v-flex :style="{ display: 'inline-flex !important', float: 'right' }">
      <v-sheet class="text-body-2 tip ml-6 kubegems__text">
        集群:
        <span class="text-body-2 font-weight-medium">
          {{ env ? env.clusterName : '' }}
        </span>
      </v-sheet>
      <v-sheet class="text-body-2 tip ml-4 kubegems__text">
        命名空间:
        <span class="text-body-2 font-weight-medium">
          {{ env ? env.namespace : '' }}
        </span>
      </v-sheet>

      <v-sheet class="text-body-2 tip ml-4 kubegems__text">
        series:
        <span class="text-body-2 font-weight-medium">
          {{ series.length > 5000 ? '5000+' : series.length }}
        </span>
      </v-sheet>
    </v-flex>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  import BaseSelect from '@/mixins/select';
  import ProjectEnvSelectCascade from '@/views/observe/components/ProjectEnvSelectCascade';

  export default {
    name: 'ProjectEnvSelect',
    components: {
      ProjectEnvSelectCascade,
    },
    mixins: [BaseSelect],
    props: {
      loading: {
        type: Boolean,
        default: () => false,
      },
      series: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        env: undefined,
      };
    },
    computed: {
      ...mapGetters(['Tenant']),
    },
    watch: {
      env: {
        handler(newValue) {
          if (newValue) {
            this.$emit('setEnvironment', this.env, this.env.projectName, this.env.trigger);
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      handleClear() {
        this.$emit('clear');
      },

      handleRefresh() {
        if (this.env) {
          this.$emit('refresh');
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .tip {
    line-height: 38px;
  }
</style>
