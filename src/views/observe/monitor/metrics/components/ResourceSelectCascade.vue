<template>
  <v-menu
    v-model="menu"
    bottom
    :close-on-content-click="false"
    max-height="350px"
    :min-width="maxWidth"
    nudge-bottom="5px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-combobox
        v-model="resource"
        dense
        flat
        hide-details
        hide-no-data
        hide-selected
        :items="items"
        label="规则模板"
        solo
        v-on="on"
      >
        <template #selection="{ attrs, item, selected }">
          <v-chip color="primary" :input-value="selected" label small v-bind="attrs">
            <span class="pr-2">{{ item.resourceShowName }}-{{ item.showName }}</span>
          </v-chip>
        </template>
      </v-combobox>
    </template>
    <v-card class="pa-2 py-3" height="350px">
      <div class="select__div" :style="{ width: resourceIndex > -1 ? '50%' : '100%' }">
        <div class="text-body-2">资源</div>
        <v-list class="px-0" dense max-height="300" rounded :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="resourceIndex" color="primary" @change="onLatitudeChange">
            <v-list-item v-for="(item, index) in resourceItems" :key="index" dense exact>
              <v-list-item-content>
                <v-list-item-title>
                  {{ item.showName }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon>mdi-chevron-right</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <v-divider v-if="resourceIndex > -1" class="float-left" vertical />
      <div v-if="resourceIndex > -1" class="select__div">
        <div class="text-body-2">规则</div>
        <v-list class="px-0" dense max-height="300" rounded :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="ruleIndex" color="primary" @change="onRuleChange">
            <v-list-item v-for="(item, index) in ruleItems" :key="index" dense exact>
              <v-list-item-content>
                <v-list-item-title v-text="item.showName" />
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
      index: {
        type: Number,
        default: () => 0,
      },
      isCluster: {
        type: Boolean,
        default: () => false,
      },
      tenant: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        menu: false,
        resource: undefined,
        maxWidth: 225,
        items: [],
        config: {},
        resourceItems: [],
        ruleItems: [],
        resourceIndex: undefined,
        ruleIndex: undefined,
      };
    },
    computed: {
      resourceObj() {
        return this.resourceIndex > -1 ? this.resourceItems[this.resourceIndex] : null;
      },
      ruleObj() {
        return this.ruleIndex > -1 ? this.ruleItems[this.ruleIndex] : null;
      },
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
      isCluster: {
        handler() {
          this.loadResources();
        },
        deep: true,
      },
    },
    methods: {
      async getMonitorConfig() {
        let data = null;
        if (this.AdminViewport) {
          data = await getSystemConfigData('Monitor', { noprocessing: true });
        } else {
          data = await getMyConfigData('Monitor', { noprocessing: true });
        }
        this.config = data?.content || {};
        this.loadResources();
      },
      formatObject2Array(obj) {
        return Object.keys(obj || {}).map((key) => ({
          _$value: key,
          ...obj[key],
        }));
      },
      loadResources() {
        const items = this.formatObject2Array(this.config.resources || {}).filter(
          (item) => this.isCluster || item.namespaced,
        );
        this.resourceItems = items;
      },
      onLatitudeChange() {
        if (this.resourceIndex > -1) {
          this.maxWidth = 450;
          this.loadRules();
        } else {
          this.maxWidth = 225;
        }
      },
      loadRules() {
        if (this.resourceIndex > -1) {
          let items = [];
          const rulesObj = this.config.resources?.[this.resourceObj._$value]?.rules || {};
          items = this.formatObject2Array(rulesObj);
          this.ruleItems = items;
        }
      },
      onRuleChange() {
        if (this.ruleIndex > -1) {
          this.resource = {
            ...this.ruleObj,
            resource: this.resourceObj._$value,
            resourceShowName: this.resourceObj.showName,
          };
          this.items = [this.resource];
          this.$emit('change', this.resource);
          this.$emit('input', this.resource);
          this.$emit('setUnit', this.index);
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
