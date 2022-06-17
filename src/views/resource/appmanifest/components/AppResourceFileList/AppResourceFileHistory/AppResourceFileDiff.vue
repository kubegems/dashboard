<template>
  <BasePanel v-model="panel" icon="fab fa-git" title="变更内容" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="ml-3 text-subtitle-1">
        {{ commit ? commit.hash : '' }}
      </span>
    </template>
    <template #content>
      <v-card>
        <v-card v-for="value in diff" :key="value.name">
          <v-card-text class="ma-0 pa-0">
            {{ value.name }}
          </v-card-text>
          <CodeDiff :new-string="value.to" :old-string="value.from" />
        </v-card>
      </v-card>
    </template>
  </BasePanel>
</template>

<script>
  import CodeDiff from 'vue-code-diff';
  import { mapState } from 'vuex';

  import { getAppResourceFileDiff } from '@/api';
  import BaseResource from '@/mixins/resource';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'AppResourceFileDiff',
    components: {
      CodeDiff,
    },
    mixins: [BaseResource],
    data: () => ({
      panel: false,
      diff: [
        {
          from: '',
          to: '',
        },
      ],
      app: null,
      commit: null,
    }),
    computed: {
      ...mapState(['Scale']),
    },
    methods: {
      open() {
        this.panel = true;
      },
      init(app, item) {
        this.app = deepCopy(app);
        this.commit = deepCopy(item);
        this.appResourceFileDiff();
      },
      async appResourceFileDiff() {
        const data = await getAppResourceFileDiff(
          this.app.TenantID,
          this.app.ProjectID,
          this.ThisAppEnvironmentID,
          this.app.name,
          {
            hash: this.commit.hash,
          },
        );
        this.diff = data;
      },
      dispose() {
        this.diff = [
          {
            from: '',
            to: '',
          },
        ];
      },
    },
  };
</script>

<style lang="scss">
  .theme--light.v-application code {
    background-color: rgba(0, 0, 0, 0) !important;
    color: currentColor;
    font-size: 13px;
    line-height: 13px !important;
    font-family: Monaco, Menlo, Consolas, Courier New, monospace, PingFang SC;
  }

  .hljs {
    height: 22px !important;
  }

  .d2h-code-line {
    font-size: 13px !important;
  }

  .d2h-diff-tbody {
    overflow: auto !important;
  }
</style>
