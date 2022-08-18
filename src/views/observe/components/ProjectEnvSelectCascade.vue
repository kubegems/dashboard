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
    :content-class="reverse ? 'menu' : ''"
    max-height="450px"
    :min-width="maxWidth"
    nudge-bottom="5px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <div v-if="reverse" class="float-left">
        <v-btn
          :class="`mr-2 ${small ? '' : 'mt-n1'} font-weight-medium ${reverseColor ? 'white--text' : 'primary--text'}`"
          :color="reverseColor ? 'primary' : 'white'"
          dark
          depressed
          :small="small"
          :style="{ marginTop: small ? `${offsetY}px` : '' }"
          v-on="on"
        >
          {{ env ? `${$root.$t('resource.environment')} ${env.environmentName}` : $root.$t('tip.select_environment') }}
          <v-icon v-if="menu" right> mdi-chevron-up </v-icon>
          <v-icon v-else right> mdi-chevron-down </v-icon>
        </v-btn>
        <div class="kubegems__clear-float" />
      </div>
      <v-combobox
        v-else
        v-model="env"
        dense
        flat
        hide-details
        hide-no-data
        hide-selected
        :items="items"
        :label="$root.$t('resource.environment')"
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
    <v-card class="pa-2 py-3" flat height="450px">
      <div class="text-subtitle-2 mx-2 kubegems__text select__title">
        <div class="float-left"> {{ $root.$t('tip.select_environment') }} </div>
        <div class="float-right">
          <v-btn color="primary" small @click="reset">{{ $root.$t('operate.reset') }}</v-btn>
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
        <div class="text-caption pa-1 mt-2">{{ $root.$t('resource.project') }}</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="300" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="projectIndex" color="primary" @change="onProjectChange">
            <v-list-item v-for="item in projectItems" :key="item.value" dense>
              <v-list-item-content>
                <v-list-item-title class="select__list__title pl-2">
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
      <v-divider v-if="show" class="float-left select__divider" vertical />
      <div v-if="show" class="select__div">
        <div class="text-caption pa-1">{{ $root.$t('resource.environment') }}</div>
        <v-divider class="mb-2" />
        <v-list class="pa-0" dense max-height="345" nav :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="environmentIndex" color="primary" @change="onEnvironmentChange">
            <v-list-item v-for="item in environmentItems" :key="item.value" dense>
              <v-list-item-content>
                <v-list-item-title class="select__list__title pl-2" v-text="item.environmentName" />
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
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ProjectEnvSelectCascade',
    mixins: [BaseSelect],
    props: {
      first: {
        type: Boolean,
        default: () => false,
      },
      offsetY: {
        type: Number,
        default: () => 0,
      },
      reverse: {
        type: Boolean,
        default: () => false,
      },
      reverseColor: {
        type: Boolean,
        default: () => false,
      },
      small: {
        type: Boolean,
        default: () => true,
      },
      tenant: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        menu: false,
        env: undefined,
        maxWidth: 275,
        items: [],
        projectItems: [],
        environmentItems: [],
        projectIndex: undefined,
        environmentIndex: undefined,

        search: '',
      };
    },
    computed: {
      show() {
        return this.projectIndex > -1 || this.search || this.environmentItems.length > 0;
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
            await this.m_select_projectSelectData(newValue.ID, true);
            this.projectItems = this.m_select_projectItems;
            if (this.first && this.m_select_projectItems.length > 0) {
              this.maxWidth = 550;
              this.projectIndex = 0;
              const project = this.m_select_projectItems[0];
              await this.m_select_projectEnvironmentSelectData(project.value);
              this.environmentItems = this.m_select_projectEnvironmentItems;
              if (this.m_select_projectEnvironmentItems.length > 0) {
                this.environmentIndex = 0;
                this.onEnvironmentChange();
              }
            } else if (this.$route.query.project && this.$route.query.environment) {
              const pIndex = this.m_select_projectItems.findIndex((p) => {
                return p.projectName === this.$route.query.project;
              });
              if (pIndex > -1) {
                this.maxWidth = 550;
                this.projectIndex = pIndex;
                const project = this.m_select_projectItems[pIndex];
                await this.m_select_projectEnvironmentSelectData(project.value);
                this.environmentItems = this.m_select_projectEnvironmentItems;
                const eIndex = this.m_select_projectEnvironmentItems.findIndex((e) => {
                  return e.environmentName === this.$route.query.environment;
                });
                if (eIndex > -1) {
                  this.environmentIndex = eIndex;
                  this.onEnvironmentChange(true);
                }
              }
            }
          }
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      async onProjectChange() {
        if (this.projectIndex > -1) {
          const item = this.m_select_projectItems[this.projectIndex];
          this.maxWidth = 550;
          await this.m_select_projectEnvironmentSelectData(item.value);
          this.environmentItems = this.m_select_projectEnvironmentItems;
        } else {
          this.maxWidth = this.environmentItems.length > 0 ? 550 : 275;
        }
      },
      onEnvironmentChange(trigger = false) {
        if (this.environmentIndex > -1) {
          const item = this.m_select_projectEnvironmentItems[this.environmentIndex];
          this.env = { ...item, trigger: trigger };
          this.items = [item];
          this.$emit('change', this.env);
          this.$emit('input', this.env);
          this.$emit('load', this.env);
          this.menu = false;
        }
      },
      onSearch() {
        if (this.search) {
          this.projectItems = this.m_select_projectItems.filter((p) => {
            return p.projectName.indexOf(this.search) > -1;
          });
          this.environmentItems = this.m_select_projectEnvironmentItems.filter((e) => {
            return e.environmentName.indexOf(this.search) > -1;
          });
        } else {
          this.projectItems = this.m_select_projectItems;
          this.environmentItems = this.m_select_projectEnvironmentItems;
        }
      },
      reset() {
        this.projectIndex = undefined;
        this.environmentIndex = undefined;
        this.environmentItems = [];
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

  .menu {
    right: 10px !important;
    left: auto !important;
  }
</style>
