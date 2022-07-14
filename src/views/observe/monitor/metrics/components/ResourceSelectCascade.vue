<template>
  <v-menu
    v-model="menu"
    bottom
    :close-on-content-click="false"
    max-height="450px"
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
    <v-card class="pa-2 py-3" flat height="450px">
      <div class="text-subtitle-2 mx-2 kubegems__text select__title">
        <div class="float-left"> 选择一个模板 </div>
        <div class="float-right">
          <v-btn color="primary" small @click="reset">重置</v-btn>
        </div>
        <div class="kubegems__clear-float" />
      </div>
      <div class="select__div" :style="{ width: show ? '50%' : '100%' }">
        <v-text-field
          v-model="search"
          class="mt-2"
          dense
          flat
          hide-details
          prepend-inner-icon="mdi-magnify"
          solo
          @keyup="onSearch"
        />
        <div class="text-caption pa-1 mt-2">资源</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="350" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="resourceIndex" color="primary" @change="onLatitudeChange">
            <v-list-item v-for="(item, index) in resourceItemsCopy" :key="index" dense>
              <v-list-item-content>
                <v-list-item-title class="select__list__title pl-2">
                  {{ item.showName }}
                  <div class="float-right text-caption mt-n1">{{ Object.keys(item.rules).length }} 模板</div>
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon>mdi-chevron-right</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <v-divider v-if="show" class="float-left select__divider" vertical />
      <div v-if="show" class="select__div">
        <div class="text-caption pa-1 mt-2">模板</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="350" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="ruleIndex" color="primary" @change="onRuleChange">
            <v-list-item v-for="(item, index) in ruleItemsCopy" :key="index" dense>
              <v-list-item-content>
                <v-list-item-title class="select__list__title pl-2" v-text="item.showName" />
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
        maxWidth: 275,
        items: [],
        config: {},
        resourceItems: [],
        resourceItemsCopy: [],
        ruleItems: [],
        ruleItemsCopy: [],
        resourceIndex: undefined,
        ruleIndex: undefined,
        search: '',
      };
    },
    computed: {
      resourceObj() {
        return this.resourceIndex > -1 ? this.resourceItems[this.resourceIndex] : null;
      },
      ruleObj() {
        return this.ruleIndex > -1 ? this.ruleItems[this.ruleIndex] : null;
      },
      show() {
        return this.resourceIndex > -1 || this.search || this.ruleItems.length > 0;
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
        this.resourceItemsCopy = items;
      },
      onLatitudeChange() {
        if (this.resourceIndex > -1) {
          this.maxWidth = 550;
          this.loadRules();
        } else {
          this.maxWidth = this.ruleItems.length > 0 ? 550 : 275;
        }
      },
      loadRules() {
        if (this.resourceIndex > -1) {
          let items = [];
          const rulesObj = this.config.resources?.[this.resourceObj._$value]?.rules || {};
          items = this.formatObject2Array(rulesObj);
          this.ruleItems = items;
          this.ruleItemsCopy = items;
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
      onSearch() {
        if (this.search) {
          this.resourceItemsCopy = this.resourceItems.filter((p) => {
            return p.showName.indexOf(this.search) > -1;
          });
          this.ruleItemsCopy = this.ruleItems.filter((e) => {
            return e.showName.indexOf(this.search) > -1;
          });
        } else {
          this.resourceItemsCopy = this.resourceItems;
          this.ruleItemsCopy = this.ruleItems;
        }
      },
      reset() {
        this.resourceIndex = undefined;
        this.ruleIndex = undefined;
        this.ruleItems = [];
        this.maxWidth = 275;
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

    &__title {
      line-height: 28px;
      font-weight: 500 !important;
    }

    &__divider {
      min-height: 93%;
      max-height: 93%;
    }

    &__list {
      &__title {
        white-space: inherit !important;
        word-break: break-all !important;
      }
    }
  }
</style>
