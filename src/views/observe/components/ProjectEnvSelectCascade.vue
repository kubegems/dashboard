<template>
  <v-menu
    v-model="menu"
    bottom
    :close-on-content-click="false"
    :content-class="reverse ? 'menu' : ''"
    max-height="350px"
    :min-width="maxWidth"
    nudge-bottom="5px"
    offset-y
    origin="top center"
    right
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <div v-if="reverse" class="float-left">
        <v-sheet
          class="text-subtitle-2 ml-4 mr-2 float-left font-weight-medium kubegems__text"
          :style="{ lineHeight: '40px' }"
        >
          环境
        </v-sheet>
        <v-btn class="mr-2 mt-1 primary--text font-weight-medium" color="white" dark depressed small v-on="on">
          {{ env ? env.environmentName : '' }}
          <v-icon v-if="menu" right> fas fa-angle-up </v-icon>
          <v-icon v-else right> fas fa-angle-down </v-icon>
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
        label="环境"
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
    <v-card class="pa-2 py-3" height="350px">
      <div class="select__div" :style="{ width: projectIndex > -1 ? '50%' : '100%' }">
        <div class="text-body-2">项目</div>
        <v-text-field
          v-model="projectSearch"
          class="mt-2"
          dense
          flat
          hide-details
          prepend-inner-icon="mdi-magnify"
          solo
          @keyup="onProjectSearch"
        />
        <v-list class="px-0" dense max-height="300" rounded :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="projectIndex" color="primary" @change="onProjectChange">
            <v-list-item v-for="item in projectItems" :key="item.value" dense exact>
              <v-list-item-content>
                <v-list-item-title class="select__title"> {{ item.projectName }} </v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <v-icon>mdi-chevron-right</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <v-divider v-if="projectIndex > -1" class="float-left" vertical />
      <div v-if="projectIndex > -1" class="select__div">
        <div class="text-body-2">环境</div>
        <v-text-field
          v-model="environmentSearch"
          class="mt-2"
          dense
          flat
          hide-details
          prepend-inner-icon="mdi-magnify"
          solo
          @keyup="onEnvironmentSearch"
        />
        <v-list class="px-0" dense max-height="300" rounded :style="{ overflowY: 'auto' }">
          <v-list-item-group v-model="environmentIndex" color="primary" @change="onEnvironmentChange">
            <v-list-item v-for="item in environmentItems" :key="item.value" dense exact>
              <v-list-item-content>
                <v-list-item-title class="select__title" v-text="item.environmentName" />
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
      reverse: {
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
        env: undefined,
        maxWidth: 225,
        items: [],
        projectItems: [],
        environmentItems: [],
        projectIndex: undefined,
        environmentIndex: undefined,

        projectSearch: '',
        environmentSearch: '',
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
            await this.m_select_projectSelectData(newValue.ID, true);
            this.projectItems = this.m_select_projectItems;
            if (this.first && this.m_select_projectItems.length > 0) {
              this.maxWidth = 450;
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
                this.maxWidth = 450;
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
          this.maxWidth = 450;
          await this.m_select_projectEnvironmentSelectData(item.value);
          this.environmentItems = this.m_select_projectEnvironmentItems;
        } else {
          this.maxWidth = 225;
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
      onProjectSearch() {
        if (this.projectSearch) {
          this.projectItems = this.m_select_projectItems.filter((p) => {
            return p.projectName.indexOf(this.projectSearch) > -1;
          });
        } else {
          this.projectItems = this.m_select_projectItems;
        }
      },
      onEnvironmentSearch() {
        if (this.environmentSearch) {
          this.environmentItems = this.m_select_projectEnvironmentItems.filter((e) => {
            return e.environmentName.indexOf(this.environmentSearch) > -1;
          });
        } else {
          this.environmentItems = this.m_select_projectEnvironmentItems;
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

    &__title {
      white-space: inherit !important;
      word-break: break-all !important;
    }
  }

  .menu {
    right: 10px !important;
    left: auto !important;
  }
</style>
