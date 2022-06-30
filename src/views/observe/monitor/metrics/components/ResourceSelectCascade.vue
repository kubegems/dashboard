<template>
  <v-menu
    v-model="menu"
    bottom
    :close-on-content-click="false"
    max-height="300px"
    :min-width="maxWidth"
    nudge-bottom="5px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-combobox
        v-model="env"
        dense
        flat
        hide-details
        hide-no-data
        hide-selected
        :items="items"
        label="资源规则"
        solo
        v-on="on"
      >
        <template #selection="{ attrs, item, selected }">
          <v-chip color="primary" :input-value="selected" label small v-bind="attrs">
            <span class="pr-2">{{ item.environmentName }}</span>
          </v-chip>
        </template>
      </v-combobox>
    </template>
    <v-card class="pa-2" height="300px">
      <div class="select__div" :style="{ width: projectIndex > -1 ? '50%' : '100%' }">
        <div class="text-body-2">资源</div>
        <v-list dense rounded>
          <v-list-item-group v-model="projectIndex" color="primary" @change="onProjectChange">
            <v-list-item v-for="item in m_select_projectItems" :key="item.value" dense exact>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.projectName }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon>mdi-chevron-right</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <div v-if="projectIndex > -1" class="select__div">
        <div class="text-body-2">规则</div>
        <v-list dense rounded>
          <v-list-item-group v-model="environmentIndex" color="primary" @change="onEnvironmentChange">
            <v-list-item v-for="item in m_select_projectEnvironmentItems" :key="item.value" dense exact>
              <v-list-item-content>
                <v-list-item-title v-text="item.environmentName" />
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <div class="kubegems__clear-float" />
    </v-card>
  </v-menu>
</template>

<script>
  import { getMyConfigData, getSystemConfigData } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ResourceSelectCascade',
    mixins: [BaseSelect],
    props: {
      // reverse: {
      //   type: Boolean,
      //   default: () => false,
      // },
      tenant: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        menu: false,
        env: undefined,
        maxWidth: 225,
        items: [],
        projectIndex: undefined,
        environmentIndex: undefined,
      };
    },
    watch: {
      value: {
        handler(newValue) {
          if (newValue) {
            this.env = newValue;
            this.items = [item];
          }
        },
        deep: true,
        immediate: true,
      },
      tenant: {
        handler: async function (newValue) {
          if (newValue) {
            this.getMonitorConfig();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async getMonitorConfig() {
        let data = null;
        if (this.AdminViewport) {
          data = await getSystemConfigData('Monitor');
        } else {
          data = await getMyConfigData('Monitor');
        }
        this.config = data?.content || {};
      },
      async onProjectChange() {
        if (this.projectIndex > -1) {
          const item = this.m_select_projectItems[this.projectIndex];
          this.maxWidth = 450;
          await this.m_select_projectEnvironmentSelectData(item.value);
        } else {
          this.maxWidth = 225;
        }
      },
      onEnvironmentChange() {
        if (this.environmentIndex > -1) {
          const item = this.m_select_projectEnvironmentItems[this.environmentIndex];
          this.env = item;
          this.items = [item];
          this.$emit('change', item);
          this.$emit('input', item);
          this.$emit('load', item);
          this.menu = false;
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .select {
    &__div {
      float: left;
      width: 50%;
      padding: 8px;
    }
  }
</style>
