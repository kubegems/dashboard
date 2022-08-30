<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->

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
        :class="{ 'my-0': singleLine }"
        :dense="!singleLine"
        :flat="!singleLine"
        :hide-details="!singleLine"
        hide-no-data
        hide-selected
        :items="items"
        :label="$t('tip.rule')"
        :solo="!singleLine"
        v-on="on"
      >
        <template #selection="{ attrs, item, selected }">
          <v-chip color="primary" :input-value="selected" :label="!singleLine" small v-bind="attrs">
            <span class="pr-2">{{ item.resourceShowName }}-{{ item.showName }}</span>
          </v-chip>
        </template>
      </v-combobox>
    </template>
    <v-card class="pa-2 py-3" flat height="450px">
      <div class="text-subtitle-2 mx-2 kubegems__text select__title">
        <div class="float-left"> {{ $t('tip.select_one_rule') }} </div>
        <div class="float-right">
          <v-btn color="primary" small @click="reset">{{ $root.$t('operate.reset') }}</v-btn>
        </div>
        <div class="kubegems__clear-float" />
      </div>
      <div class="select__div" :style="{ width: getWidth() }">
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
        <div class="text-caption pa-1 mt-2">{{ $t('tip.group') }}</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="300" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="scopeIndex" color="primary" @change="onScopeChange">
            <v-list-item v-for="(item, index) in scopeItemsCopy" :key="index" dense>
              <v-list-item-content>
                <v-list-item-title class="select__list__title pl-2">
                  {{ item.showName }}
                  <div class="float-right text-caption mt-n1">{{ item.resources.length }} 资源</div>
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon>mdi-chevron-right</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <v-divider v-if="showResource" class="float-left select__divider" vertical />
      <div v-if="showResource" class="select__div" :style="{ width: getWidth() }">
        <div class="text-caption pa-1 mt-2">{{ $t('tip.resource') }}</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="345" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="resourceIndex" color="primary" @change="onResourceChange">
            <v-list-item v-for="(item, index) in resourceItemsCopy" :key="index" dense>
              <v-list-item-avatar class="mr-0" size="28">
                <BaseLogo default-logo="kubegems" :icon-name="item.showName" :ml="0" :mt="1" :width="20" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="select__list__title pl-2">
                  {{ item.showName }}
                  <div class="float-right text-caption mt-n1">{{ item.rules.length }} 规则</div>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>

      <v-divider v-if="showRule" class="float-left select__divider" vertical />
      <div v-if="showRule" class="select__div" :style="{ width: getWidth() }">
        <div class="text-caption pa-1 mt-2">{{ $t('tip.rule') }}</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="345" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="ruleIndex" color="primary" @change="onRuleChange">
            <v-list-item v-for="(item, index) in ruleItemsCopy" :key="index" dense>
              <v-list-item-content>
                <v-tooltip :close-delay="200" right>
                  <template #activator="{ on }">
                    <v-list-item-title class="select__list__title pl-2" v-on="on" v-text="item.showName" />
                  </template>
                  <template #default>
                    <span class="text-caption">{{ item.description || $root.$t('data.no_data') }}</span>
                  </template>
                </v-tooltip>
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
  import messages from '../../i18n';
  import { getRuleList, getRuleResourceList, getRuleScopeList, getRuleSearch } from '@/api';
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ResourceSelectCascade',
    i18n: {
      messages: messages,
    },
    mixins: [BaseSelect],
    props: {
      generator: {
        type: Object,
        default: () => null,
      },
      index: {
        type: Number,
        default: () => 0,
      },
      isCluster: {
        type: Boolean,
        default: () => false,
      },
      singleLine: {
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
        resourceItems: [],
        resourceItemsCopy: [],
        scopeItems: [],
        scopeItemsCopy: [],
        ruleItems: [],
        ruleItemsCopy: [],
        scopeIndex: undefined,
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
      scopeObj() {
        return this.scopeIndex > -1 ? this.scopeItems[this.scopeIndex] : null;
      },
      showResource() {
        return this.scopeIndex > -1 || this.search || this.resourceItems.length > 0;
      },
      showRule() {
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
            this.ruleScopeList();
          }
        },
        deep: true,
        immediate: true,
      },
      isCluster: {
        handler() {
          this.ruleScopeList();
        },
        deep: true,
      },
      generator: {
        handler(newValue) {
          if (newValue) {
            this.loadRule();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async loadRule() {
        const data = await getRuleSearch({
          scope: this.generator.scope,
          resource: this.generator.resource,
          rule: this.generator.rule,
        });
        this.scopeIndex = this.scopeItems.findIndex((s) => {
          return s.id === data.scopeID;
        });

        this.ruleResourceList(data.scopeID, data.resourceID);
        this.ruleList(data.resourceID, data.ruleID);
      },
      async ruleScopeList() {
        const data = await getRuleScopeList(this.tenant.ID, { noprocessing: true, size: 1000, preload: 'Resources' });
        this.scopeItems = data.List;
        this.scopeItemsCopy = data.List;
      },
      async ruleResourceList(scopeId, resourceId = -1) {
        const data = await getRuleResourceList(this.tenant.ID, scopeId, {
          noprocessing: true,
          size: 1000,
          preload: 'Rules',
        });
        this.resourceItems = data.List;
        this.resourceItemsCopy = data.List;
        if (this.generator) {
          this.resourceIndex = this.resourceItems.findIndex((r) => {
            return r.id === resourceId;
          });
        }
      },
      async ruleList(resourceId, ruleId = -1) {
        const data = await getRuleList(this.tenant.ID, resourceId, { noprocessing: true, size: 1000 });
        this.ruleItems = data.List;
        this.ruleItemsCopy = data.List;
        if (this.generator) {
          this.ruleIndex = this.ruleItems.findIndex((r) => {
            return r.id === ruleId;
          });
          this.onRuleChange();
          this.maxWidth = 825;
        }
      },
      onResourceChange() {
        if (this.resourceIndex > -1) {
          this.maxWidth = 825;
          this.loadRules();
        } else {
          this.maxWidth = this.ruleItems.length > 0 ? 825 : 550;
        }
      },
      onScopeChange() {
        if (this.scopeIndex > -1) {
          const scope = this.scopeItemsCopy[this.scopeIndex];
          this.ruleResourceList(scope.id);
        }
        this.resourceIndex = undefined;
        if (this.resourceItems.length > 0 && this.ruleItems.length > 0) {
          this.maxWidth = 825;
        } else if (this.scopeIndex > -1 || this.resourceItems.length > 0) {
          this.maxWidth = 550;
        } else {
          this.maxWidth = 275;
        }
      },
      loadRules() {
        if (this.resourceIndex > -1) {
          const resource = this.resourceItemsCopy[this.resourceIndex];
          this.ruleList(resource.id);
        }
      },
      onRuleChange() {
        if (this.ruleIndex > -1) {
          this.resource = {
            ...this.ruleObj,
            resource: this.resourceObj?.name,
            resourceShowName: this.resourceObj?.showName,
            rule: this.ruleObj.name,
            scope: this.scopeObj.name,
            namespaced: this.scopeObj.namespaced,
          };
          this.items = [this.resource];
          this.$emit('change', this.resource);
          this.$emit('input', this.resource);
          this.$emit('setData', this.index);
          this.menu = false;
        }
      },
      async onSearch() {
        if (this.search) {
          this.ruleItemsCopy = this.ruleItems.filter((e) => {
            return e.showName.toLowerCase().indexOf(this.search) > -1;
          });
          this.maxWidth = 825;
        } else {
          this.ruleItemsCopy = this.ruleItems;
          if (this.showResource && this.showRule) {
            this.maxWidth = 825;
          } else if (this.showResource) {
            this.maxWidth = 550;
          } else {
            this.maxWidth = 275;
          }
        }
      },
      reset() {
        this.scopeIndex = undefined;
        this.resourceIndex = undefined;
        this.ruleIndex = undefined;
        this.resourceItems = [];
        this.ruleItems = [];
        this.maxWidth = 275;
      },
      getWidth() {
        if (this.showResource && this.showRule) {
          return '33.333333%';
        }
        if (this.showResource) {
          return '50%';
        }
        return '100%';
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
