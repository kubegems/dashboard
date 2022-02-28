<template>
  <v-card>
    <v-card-text class="pa-7">
      <div class="d-flex justify-center my-3">
        <div class="text-center">
          <img
            class="img"
            src="/icon/ai-model.png"
          />
          <h3 class="mt-2 text-h6 font-weight-medium primary--text">
            {{ model.name }}
          </h3>
          <div
            v-if="showVersion"
            class="mx-1"
          >
            <span class="text-body-2">AI模型版本</span>
            <v-menu
              v-model="modelMenu"
              bottom
              left
              offset-y
              origin="top center"
              transition="scale-transition"
              nudge-bottom="5px"
              z-index="4"
            >
              <template #activator="{ on }">
                <v-btn
                  text
                  color="white"
                  class="primary--text font-weight-medium px-2"
                  v-on="on"
                >
                  {{ selectVersion }}
                  <v-icon
                    v-if="modelMenu"
                    right
                  >
                    fas fa-angle-up
                  </v-icon>
                  <v-icon
                    v-else
                    right
                  >
                    fas fa-angle-down
                  </v-icon>
                </v-btn>
              </template>
              <v-data-iterator
                :items="[{ text: '版本', values: versions }]"
                hide-default-footer
                class="file-iterator"
              >
                <template #no-data>
                  <v-card>
                    <v-card-text> 暂无版本 </v-card-text>
                  </v-card>
                </template>
                <template #default="props">
                  <v-card
                    max-height="300"
                    class="overflow-y"
                  >
                    <v-list
                      v-for="item in props.items"
                      :key="item.text"
                      dense
                    >
                      <v-list-item
                        v-for="(version, index) in item.values"
                        :key="index"
                        class="text-body-2 text-center font-weight-medium"
                        link
                        :style="
                          version === selectVersion
                            ? `color: #1e88e5 !important;`
                            : ``
                        "
                        @click="setVersion(version)"
                      >
                        <v-list-item-content>
                          <span>{{ version }}</span>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </template>
              </v-data-iterator>
            </v-menu>
          </div>
        </div>
      </div>
      <v-divider />
      <div class="py-5">
        <h5 class="text-subtitle-1 kubegems__detail">模型仓库</h5>
        <h6 class="text-body-2 mb-3">
          {{ model.repository }}
        </h6>
        <h5 class="text-subtitle-1 kubegems__detail">描述</h5>
        <h6 class="text-body-2 mb-3">
          {{ model.description }}
        </h6>
        <h5 class="text-subtitle-1 kubegems__detail">创建时间</h5>
        <h6 class="text-body-2 mb-3">
          {{ model.createdAt ? $moment(model.createdAt).format('lll') : '' }}
        </h6>
        <template v-if="model.maintainers && model.maintainers.length > 0">
          <h5 class="text-subtitle-1 kubegems__detail">维护者</h5>
          <h6 class="text-body-2 mb-3">
            <div
              v-for="(maintainer, index) in model.maintainers"
              :key="index"
              class="mb-3"
            >
              <span
                v-if="maintainer.name"
                class="mr-2"
              >
                <v-icon small>mdi-account-circle</v-icon>
                {{ maintainer.name }}
              </span>
              <span
                v-if="maintainer.email"
                class="mr-2"
              >
                <v-icon
                  small
                  left
                >mdi-email</v-icon>
                <a :href="`mailto:${maintainer.email}`">
                  {{ maintainer.email }}
                </a>
              </span>
            </div>
          </h6>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'ModelInfo',
  props: {
    model: {
      type: Object,
      default: () => null,
    },
    showVersion: {
      type: Boolean,
      default: () => true,
    },
    versions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      selectVersion: '',
      modelMenu: false,
    }
  },
  methods: {
    setVersion(version) {
      this.selectVersion = version
    },
  },
}
</script>

<style lang="scss" scoped>
.img {
  width: 100px;
  height: 100px;
  margin-left: 8px;
}
</style>
