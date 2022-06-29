<template>
  <v-sheet class="text-body-2 text--darken-1 d-flex align-center mx-1 my-4 version">
    <div class="kubegems__full-center">
      <span class="text-body-2 mr-1">版本</span>
      <v-menu
        v-model="versionMenu"
        bottom
        class="mx-1 px-1"
        left
        offset-y
        origin="top center"
        transition="scale-transition"
      >
        <template #activator="{ on }">
          <v-btn class="primary--text font-weight-medium" color="white" text v-on="on">
            {{ selectVersion }}
            <v-icon v-if="versionMenu" right> fas fa-angle-up </v-icon>
            <v-icon v-else right> fas fa-angle-down </v-icon>
          </v-btn>
        </template>
        <v-data-iterator class="file-iterator" hide-default-footer :items="[{ text: '版本', values: versionItems }]">
          <template #no-data>
            <v-card>
              <v-card-text> 暂无版本 </v-card-text>
            </v-card>
          </template>
          <template #default="props">
            <v-card v-for="item in props.items" :key="item.text" min-height="100">
              <v-list dense>
                <v-flex class="text-subtitle-2 text-center ma-2">
                  <span>版本</span>
                </v-flex>
                <v-divider class="mx-2" />
                <v-list-item
                  v-for="(ver, index) in item.values"
                  :key="index"
                  class="text-body-2 text-center font-weight-medium mx-2"
                  link
                  :style="ver === selectVersion ? `color: #1e88e5 !important;` : ``"
                  @click="setVersion(ver)"
                >
                  <v-list-item-content>
                    <span>{{ ver }}</span>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </template>
        </v-data-iterator>
      </v-menu>
    </div>
  </v-sheet>
</template>

<script>
  export default {
    name: 'VersionSelect',
    data() {
      return {
        versionMenu: false,
        versionItems: [],
        selectVersion: '',
      };
    },
    watch: {
      value: {
        handler(newValue) {
          this.selectRepo = newValue;
        },
        deep: true,
        immediate: true,
      },
    },
    methods: {
      setVersion() {
        this.$emit('change', this.selectRepo);
        this.$emit('input', this.selectRepo);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .version {
    position: relative;
  }
</style>
