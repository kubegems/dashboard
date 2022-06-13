<template>
  <v-row>
    <v-col cols="6">
      <v-autocomplete
        v-model="projectId"
        class="my-0"
        color="primary"
        hide-selected
        item-text="projectName"
        :items="m_select_projectItems"
        label="项目"
        :menu-props="{
          bottom: true,
          left: true,
          origin: `top center`,
        }"
        no-data-text="暂无可选数据"
        @change="onProjectChange"
      >
        <template #selection="{ item }">
          <v-chip class="mx-1" color="primary" small>
            {{ item['projectName'] }}
          </v-chip>
        </template>
      </v-autocomplete>
    </v-col>
    <v-col cols="6">
      <v-autocomplete
        v-model="environmentId"
        class="my-0"
        color="primary"
        hide-selected
        item-text="environmentName"
        :items="m_select_projectEnvironmentItems"
        label="环境"
        :menu-props="{
          bottom: true,
          left: true,
          origin: `top center`,
        }"
        no-data-text="暂无可选数据"
        @change="onEnvironmentChange"
      >
        <template #selection="{ item }">
          <v-chip class="mx-1" color="primary" :disabled="item.disabled" small>
            {{ item['text'] }}
          </v-chip>
        </template>
      </v-autocomplete>
    </v-col>
  </v-row>
</template>

<script>
  import BaseSelect from '@/mixins/select';

  export default {
    name: 'ProjectEnvSelect',
    mixins: [BaseSelect],
    props: {
      t: {
        type: String,
        default: () => 'trace',
      },
    },
    data() {
      return {
        projectId: undefined,
        environmentId: undefined,
        env: undefined,
      };
    },
    watch: {
      value: {
        handler(newValue) {
          this.env = newValue;
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.m_select_projectSelectData();
      });
    },
    methods: {
      async onProjectChange() {
        await this.m_select_projectEnvironmentSelectData(this.projectId, false, true, false);
        if (this.t === 'logging') {
          this.m_select_projectEnvironmentItems = this.m_select_projectEnvironmentItems.map((e) => {
            if (e.nsLabels && e.nsLabels['gems.kubegems.io/logging'] === 'enabled') {
              e.disabled = true;
              e.environmentName = `${e.environmentName}(已接入日志采集)`;
            }
            return { ...e };
          });
        }
      },
      onEnvironmentChange() {
        this.env = this.m_select_projectEnvironmentItems.find((e) => {
          return e.value === this.environmentId;
        });
        this.$emit('input', this.env);
        this.$emit('change', this.env);
      },
    },
  };
</script>
