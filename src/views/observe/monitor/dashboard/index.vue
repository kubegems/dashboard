<template>
  <v-container
    fluid
    class="dash"
  >
    <BaseBreadcrumb
      class="dash__header"
    />

    <v-card flat>
      <v-card-text
        id="monitor__dashboard"
        class="pa-0"
      >
        <v-tabs
          height="40"
          class="rounded-t pl-4 pt-4 pr-12"
        >
          <v-tab
            v-for="item in items"
            :key="item"
          >
            {{ item }}
          </v-tab>
        </v-tabs>
        <v-menu
          :attach="`#monitor__dashboard`"
          left
        >
          <template #activator="{ on, attrs }">
            <v-btn
              class="dash__menu"
              text
              color="primary"
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon small>
                fas fa-ellipsis-v
              </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2">
              <v-flex>
                <v-btn
                  text
                  color="primary"
                  @click="addPanel"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建监控大盘
                </v-btn>
              </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>

        <div class="text-h6 text-center dash__tip primary--text">
          <span class="kubegems__full-center">请先创建监控大盘</span>
        </div>
      </v-card-text>
    </v-card>

    <AddPanel ref="addPanel" />
  </v-container>
</template>

<script>
import AddPanel from './components/AddPanel'

export default {
  name: 'MonitorDashboard',
  components: {
    AddPanel,
  },
  data() {
    return {
      items: [
        '大盘1', '大盘2', '大盘3', '大盘4',
      ],
    }
  },
  methods: {
    addPanel() {
      this.$refs.addPanel.open()
    },
  },
}
</script>

<style lang="scss" scoped>
.dash {
  &__menu {
    position: absolute;
    right: 16px;
    top: 16px;
  }

  &__tip {
    height: 460px;
    position: relative;
  }
}
</style>
