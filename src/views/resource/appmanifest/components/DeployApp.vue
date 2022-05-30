<template>
  <BaseDialog
    v-model="dialog"
    :width="1200"
    title="部署应用"
    icon="mdi-send"
    @reset="reset"
  >
    <template #content>
      <v-card-text class="pa-0">
        <v-flex
          v-if="ThisAppEnvironmentID > 0 && !AdminViewport"
          class="text-subtitle-2 primary--text px-0"
        >
          环境: {{ Environment().EnvironmentName }}
        </v-flex>
        <v-flex v-else>
          <template v-if="AdminViewport">
            项目:
            <v-menu
              bottom
              right
              offset-y
              origin="top center"
              transition="scale-transition"
              nudge-bottom="5px"
            >
              <template #activator="{ on }">
                <v-btn
                  depressed
                  color="white"
                  class="primary--text"
                  small
                  dark
                  v-on="on"
                  @click="m_select_projectSelectData"
                >
                  <v-icon left>fas fa-cube</v-icon>
                  {{ projectName }}
                  <v-icon right>fas fa-angle-down</v-icon>
                </v-btn>
              </template>
              <v-data-iterator
                :items="[{ text: '项目', values: m_select_projectItems }]"
                hide-default-footer
              >
                <template #no-data>
                  <v-card>
                    <v-card-text> 暂无项目 </v-card-text>
                  </v-card>
                </template>
                <template #default="props">
                  <v-card
                    v-for="item in props.items"
                    :key="item.text"
                  >
                    <v-list dense>
                      <v-flex class="text-subtitle-2 text-center ma-2">
                        <span>项目</span>
                      </v-flex>
                      <v-divider class="mx-2" />
                      <v-list-item
                        v-for="(project, index) in item.values"
                        :key="index"
                        class="text-body-2 text-center"
                        link
                        :style="
                          project.projectName === projectName
                            ? `color: #1e88e5 !important;`
                            : ``
                        "
                        @click="setProject(project)"
                      >
                        <v-list-item-content>
                          <span>{{ project.text }}</span>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </template>
              </v-data-iterator>
            </v-menu>
          </template>
          环境:
          <v-btn-toggle
            v-model="environmentIndex"
            dense
            color="primary"
            mandatory
            borderless
            class="my-2"
            @change="onEnvironmentChange"
          >
            <v-btn
              v-for="(environment, index) in m_select_projectEnvironmentItems"
              :key="index"
              small
            >
              {{ environment.text }}
            </v-btn>
          </v-btn-toggle>
        </v-flex>
        <v-text-field
          v-model="search"
          class="mt-2 pt-0"
          hide-details
          prepend-inner-icon="mdi-magnify"
        />
        <v-data-table
          disable-sort
          class="mt-2 deploy__table"
          :headers="headers"
          :items="items"
          :items-per-page="500"
          no-data-text="暂无数据"
          no-results-text="暂无匹配应用"
          hide-default-footer
          :search.sync="search"
          show-select
          @toggle-select-all="selectAllApp"
        >
          <template #[`item.data-table-select`]="{ item }">
            <v-checkbox
              v-model="item.published"
              hide-details
              @click.stop
            />
          </template>
          <template #[`item.images`]="{ item }">
            <v-flex
              v-for="(value, key) in item.images"
              :key="key"
              class="py-3"
            >
              {{ key }}
            </v-flex>
          </template>
          <template #[`item.runningTag`]="{ item }">
            <v-flex
              v-for="(value, key) in item.images"
              :key="key"
              class="py-3"
            >
              {{ splitImage(value.running, 'tag') }}
            </v-flex>
          </template>
          <template #[`item.publishTag`]="{ item }">
            <v-flex
              v-for="(value, key) in item.images"
              :key="key"
              class="py-1"
            >
              <v-menu
                v-model="tagMenus[`${item.index}-${key}`].menu"
                bottom
                right
                offset-y
                origin="top center"
                transition="scale-transition"
                nudge-bottom="5px"
                :close-on-content-click="false"
                content-class="tag__menu"
              >
                <template #activator="{ on }">
                  <v-chip
                    label
                    color="white"
                    class="primary--text font-weight-medium"
                    v-on="on"
                    @click="appImageTags(key)"
                  >
                    {{ splitImage(value.publish, 'tag') }}
                    <v-icon
                      v-if="tagMenus[`${item.index}-${key}`].menu"
                      small
                      right
                    >
                      fas fa-angle-up
                    </v-icon>
                    <v-icon
                      v-else
                      small
                      right
                    >
                      fas fa-angle-down
                    </v-icon>
                  </v-chip>
                </template>
                <v-flex>
                  <v-flex class="px-3 pt-3 white search-filter">
                    <v-text-field
                      v-model="tagMenus[`${item.index}-${key}`].search"
                      solo
                      dense
                      flat
                      hide-details
                      label="回车创建"
                      @keyup.enter="
                        createTag(`${item.index}-${key}`, key, item.name)
                      "
                    />
                  </v-flex>
                  <v-data-iterator
                    :items="[{ text: 'Tag', values: tags }]"
                    hide-default-footer
                    class="iterator rounded-b"
                  >
                    <template #no-data>
                      <v-card>
                        <v-card-text> 暂无Tag </v-card-text>
                      </v-card>
                    </template>
                    <template #default="props">
                      <v-card
                        v-for="iterdata in props.items"
                        :key="iterdata.text"
                        class="tag-card rounded-b"
                      >
                        <v-list dense>
                          <v-list-item
                            v-for="(tag, index) in iterdata.values"
                            :key="index"
                            class="text-body-2 text-center"
                            link
                            :style="
                              tag.image === value.publish
                                ? `color: #1e88e5 !important;`
                                : ``
                            "
                            @click="
                              setTag(
                                tag.image,
                                key,
                                item.name,
                                tag.unpublishable,
                                item.index,
                              )
                            "
                          >
                            <v-list-item-content>
                              <span>
                                {{ tag.name }}
                                <span
                                  v-if="tag.unpublishable"
                                  class="error--text"
                                >
                                  (不可部署)
                                </span>
                              </span>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </template>
                  </v-data-iterator>
                </v-flex>
              </v-menu>
            </v-flex>
          </template>
        </v-data-table>
      </v-card-text>
    </template>
    <template #action>
      <v-btn
        class="float-right"
        color="primary"
        text
        :loading="Circular"
        @click="deployEnvironmentApps"
      >
        确定
      </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import {
  getEnvironmentAppImageList,
  getAppImageTags,
  postDeployEnvironmentAppImages,
} from '@/api'
import BaseResource from '@/mixins/resource'
import BaseSelect from '@/mixins/select'

export default {
  name: 'DeployApp',
  mixins: [BaseResource, BaseSelect],
  data: () => ({
    dialog: false,
    items: [],
    tagMenus: [],
    headers: [
      { text: '应用名称', value: 'name', align: 'start' },
      { text: '应用类型', value: 'kind', align: 'start' },
      { text: '镜像', value: 'images', align: 'start' },
      { text: '当前Tag', value: 'runningTag', align: 'start' },
      { text: '部署Tag', value: 'publishTag', align: 'start' },
    ],
    tags: [],
    environmentIndex: 0,
    environmentID: 0,
    projectName: '',
    search: '',
  }),
  computed: {
    ...mapState(['Circular', 'AdminViewport']),
    ...mapGetters(['Environment', 'Project', 'Tenant']),
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    open() {
      this.dialog = true
    },
    // eslint-disable-next-line vue/no-unused-properties
    async init() {
      if (this.AdminViewport) {
        await this.m_select_projectSelectData()
        if (this.m_select_projectItems.length > 0) {
          this.projectName = this.m_select_projectItems[0].projectName
          await this.m_select_projectEnvironmentSelectData(this.m_select_projectItems[0].value)
          this.onEnvironmentChange()
        }
      } else {
        if (this.Project().ID > 0) {
          this.onEnvironmentChange()
        }
      }
    },
    async setProject(item) {
      this.projectName = item.projectName
      await this.m_select_projectEnvironmentSelectData(item.value)
      await this.onEnvironmentChange()
    },
    onEnvironmentChange() {
      // 非admin时不用选择，避免发送list env请求耗时
      if (!this.AdminViewport) {
        this.environmentAppList()
        return
      }

      if (this.m_select_projectEnvironmentItems.length > 0) {
        this.environmentID =
          this.m_select_projectEnvironmentItems[this.environmentIndex].value
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '当前项目下无环境',
          color: 'warning',
        })
        this.items = []
        return
      }
      this.environmentAppList()
    },
    splitImage(image, type) {
      const match = new RegExp(
        '([\\w|/|\\.|-]+)?[:|@]?([\\w|\\.|-]+)?',
        'g',
      ).exec(image)

      if (match) {
        if (type === 'image') {
          return match[1]
        } else if (type === 'tag') {
          return match[2]
        }
        return ''
      }
      return ''
    },
    async environmentAppList() {
      const data = await getEnvironmentAppImageList(
        this.Tenant().ID,
        this.Project().ID,
        this.AdminViewport
          ? this.environmentID
          : this.ThisAppEnvironmentID
          ? this.ThisAppEnvironmentID
          : this.environmentID,
      )
      const items = data.map((d, index) => {
        return { index: index, ...d }
      })
      items.forEach((item, index) => {
        for (const key in item.images) {
          this.tagMenus[`${index}-${key}`] = {
            search: '',
            menu: false,
          }
        }
      })
      this.items = items
    },
    async appImageTags(image) {
      this.tags = []
      const data = await getAppImageTags(this.Tenant().ID, this.Project().ID, {
        image: image,
      })
      this.tags = data
    },
    createTag(key, image, applicationName) {
      this.tagMenus[key].menu = false
      const tag = this.tagMenus[key].search
      const index = this.items.findIndex((app) => {
        return app.name === applicationName
      })
      if (index > -1) {
        const app = this.items[index]
        app.images[image].publish = `${this.splitImage(image, 'image')}:${tag}`
        this.$set(this.items, index, app)
      }
    },
    setTag(tag, image, applicationName, unpublishable, imageIndex) {
      this.tagMenus[`${imageIndex}-${image}`].menu = false
      if (unpublishable) {
        this.$store.commit('SET_SNACKBAR', {
          text: '该tag不可部署',
          color: 'warning',
        })
        return
      }
      const index = this.items.findIndex((app) => {
        return app.name === applicationName
      })
      if (index > -1) {
        const app = this.items[index]
        app.images[image].publish = tag
        this.$set(this.items, index, app)
      }
    },
    selectAllApp(checkObj) {
      this.items.forEach((app, index) => {
        app.published = checkObj.value
        this.$set(this.items, index, app)
      })
    },
    checkAllApp() {
      let ok = false
      this.items.forEach((app) => {
        if (app.published) {
          ok = true
          return
        }
      })
      return ok
    },
    checkAllPublished() {
      let ok = true
      this.items.forEach((app) => {
        for (const key in app.images) {
          if (app.images[key].publish === '' && app.published) {
            ok = false
            return
          }
        }
      })
      return ok
    },
    async deployEnvironmentApps() {
      if (!this.checkAllApp()) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请勾选需要部署的应用',
          color: 'warning',
        })
        return
      }
      if (!this.checkAllPublished()) {
        this.$store.commit('SET_SNACKBAR', {
          text: '请选择部署应用的tag',
          color: 'warning',
        })
        return
      }
      this.$store.commit('SET_CONFIRM', {
        title: '部署应用',
        content: {
          text: `部署应用 ${this.items
            .filter((app) => {
              return app.published
            })
            .map((app) => {
              return app.name
            })
            .join(',')}`,
          type: 'confirm',
        },
        param: {},
        doFunc: async () => {
          await postDeployEnvironmentAppImages(
            this.Tenant().ID,
            this.Project().ID,
            this.ThisAppEnvironmentID
              ? this.ThisAppEnvironmentID
              : this.environmentID,
            this.items,
          )
          this.dialog = false
          this.$emit('refresh')
        },
      })
    },
    reset() {
      this.dialog = false
    },
  },
}
</script>

<style lang="scss">
.iterator {
  min-width: 150px;
  max-width: 200px;
  max-height: 200px;
  overflow-y: auto;
}
.tag-card {
  max-height: 200px;
  overflow-y: auto;
}
.search-filter {
  z-index: 999;
  min-width: 150px;
  max-width: 200px;
}
.tag__menu {
  min-height: 60px !important;
}

.deploy__table .v-data-table__wrapper {
  max-height: 500px;
}
</style>
