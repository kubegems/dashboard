<template>
  <BasePanel
    v-model="panel"
    title="变更内容"
    :width="`50%`"
    icon="fab fa-git"
    @dispose="dispose"
  >
    <template #header>
      <span class="ml-3 text-subtitle-1">
        {{ commit ? commit.hash : '' }}
      </span>
    </template>
    <template #content>
      <v-card>
        <v-card
          v-for="value in diff"
          :key="value.name"
        >
          <v-card-text class="ma-0 pa-0">
            {{ value.name }}
          </v-card-text>
          <CodeDiff
            :old-string="value.from"
            :new-string="value.to"
          />
        </v-card>
      </v-card>
    </template>
  </BasePanel>
</template>

<script>
import { mapState } from 'vuex'
import { getAppResourceFileDiff } from '@/api'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

import CodeDiff from 'vue-code-diff'

export default {
  name: 'AppResourceFileDiff',
  components: { CodeDiff },
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
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.panel = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    init(app, item) {
      this.app = deepCopy(app)
      this.commit = deepCopy(item)
      this.appResourceFileDiff()
    },
    async appResourceFileDiff() {
      const data = await getAppResourceFileDiff(
        this.app.TenantID,
        this.app.ProjectID,
        this.ThisAppEnvironmentID,
        this.app.name,
        {
          hash: this.commit.hash,
          noprocessing: true,
        },
      )
      this.diff = data
    },
    dispose() {
      this.diff = [
        {
          from: '',
          to: '',
        },
      ]
    },
  },
}
</script>

<style lang="scss">
.theme--light.v-application code {
  background-color: rgba(0, 0, 0, 0) !important;
  color: currentColor;
  font-size: 12px;
  line-height: 12px !important;
  font-family: Monaco, Menlo, Consolas, Courier New, monospace;
}

.hljs {
  height: 16px !important;
}

.d2h-code-line {
  font-size: 13px !important;
}

.d2h-diff-tbody {
  overflow: auto !important;
}
</style>
