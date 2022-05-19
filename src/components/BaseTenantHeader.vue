<template>
  <v-card class="rounded-tr-0 rounded-tl-0 mb-3" height="60">
    <v-card-title class="py-3 mt-n3" style="height: 60px;">
      <v-sheet v-if="selectable" class="text-subtitle-1">
        项目
        <v-menu
          v-model="projectMenu"
          bottom
          right
          offset-y
          origin="top center"
          transition="scale-transition"
          nudge-bottom="5px"
          content-class="tenant-header__bg"
          max-height="300px"
        >
          <template #activator="{ on }">
            <v-btn
              depressed
              color="white"
              class="primary--text text-subtitle-1 font-weight-medium mt-n1"
              small
              dark
              v-on="on"
              @click="m_select_tenantProjectSelectData"
            >
              <v-icon left>fas fa-cube</v-icon>
              {{ Project().ProjectName }}
              <v-icon v-if="projectMenu" right>fas fa-angle-up</v-icon>
              <v-icon v-else right>fas fa-angle-down</v-icon>
            </v-btn>
          </template>
          <v-data-iterator
            :items="[{ text: '项目', values: m_select_tenantProjectItems }]"
            hide-default-footer
          >
            <template #no-data>
              <v-card>
                <v-card-text> 暂无项目 </v-card-text>
              </v-card>
            </template>
            <template #default="props">
              <v-card v-for="item in props.items" :key="item.text">
                <v-list dense>
                  <v-flex class="text-subtitle-2 text-center ma-2">
                    <span>项目</span>
                  </v-flex>
                  <v-divider class="mx-2"></v-divider>
                  <v-list-item
                    v-for="(project, index) in item.values"
                    :key="index"
                    class="text-body-2 text-center font-weight-medium px-2"
                    link
                    :style="
                      project.text === Project().ProjectName
                        ? `color: #1e88e5 !important;`
                        : ``
                    "
                    @click="setProject(project)"
                  >
                    <v-list-item-content class="text-body-2 font-weight-medium text-start">
                      <div>
                        <v-icon left small color="primary">fas fa-cube</v-icon>
                        {{ project.text }}
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </template>
          </v-data-iterator>
        </v-menu>
      </v-sheet>
      <v-sheet v-else class="text-subtitle-1">
        项目
        <span class="text-subtitle-1 ml-2 primary--text font-weight-medium">
          {{ Project().ProjectName }}
        </span>
        <v-btn icon @click="toProject">
          <v-icon small color="primary"> mdi-open-in-new </v-icon>
        </v-btn>
      </v-sheet>

      <template v-if="environmented">
        <v-sheet v-if="selectable" class="text-subtitle-1 ml-4">
          环境
          <v-menu
            v-model="environmentMenu"
            bottom
            right
            offset-y
            origin="top center"
            transition="scale-transition"
            nudge-bottom="5px"
            content-class="z-index-bg"
            max-height="300px"
          >
            <template #activator="{ on }">
              <v-btn
                depressed
                color="white"
                class="primary--text text-subtitle-1 font-weight-medium mt-n1"
                small
                dark
                v-on="on"
                @click.stop="m_select_projectEnvironmentSelectData(Project().ID)"
              >
                <v-icon left>fas fa-cloud</v-icon>
                {{ Environment().EnvironmentName }}
                <v-icon v-if="environmentMenu" right>fas fa-angle-up</v-icon>
                <v-icon v-else right>fas fa-angle-down</v-icon>
              </v-btn>
            </template>
            <v-data-iterator
              :items="[{ text: '环境', values: m_select_projectEnvironmentItems }]"
              hide-default-footer
            >
              <template #no-data>
                <v-card>
                  <v-card-text> 暂无环境 </v-card-text>
                </v-card>
              </template>
              <template #default="props">
                <v-card v-for="item in props.items" :key="item.text">
                  <v-list dense>
                    <v-flex class="text-subtitle-2 text-center ma-2">
                      <span>环境</span>
                    </v-flex>
                    <v-divider class="mx-2"></v-divider>
                    <v-list-item
                      v-for="(environment, index) in item.values"
                      :key="index"
                      class="text-body-2 text-center font-weight-medium px-2"
                      link
                      :style="
                        environment.text === Environment().EnvironmentName
                          ? `color: #1e88e5 !important;`
                          : ``
                      "
                      @click="setEnvironment(environment)"
                    >
                      <v-list-item-content
                        class="text-body-2 font-weight-medium text-start"
                      >
                        <div>
                          <v-icon left small color="primary">fas fa-cloud</v-icon>
                          {{ environment.text }}
                        </div>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>
              </template>
            </v-data-iterator>
          </v-menu>
        </v-sheet>
        <v-sheet v-else class="text-subtitle-1 ml-4">
          环境
          <span class="text-subtitle-1 ml-2 primary--text font-weight-medium">
            {{ Environment().EnvironmentName }}
          </span>
        </v-sheet>
      </template>

      <v-spacer />

      <v-sheet>
        <span v-if="environmented" class="text-body-2 kubegems__role">
          环境角色:
          {{
            $RESOURCE_ROLE[m_permisson_resourceRole] ? $RESOURCE_ROLE[m_permisson_resourceRole] : '暂无'
          }}
          <span class="ml-4">
            环境类型:
            {{
              $METATYPE_CN[Environment().Type]
                ? $METATYPE_CN[Environment().Type].cn
                : ''
            }}
          </span>
          <span class="ml-4">集群: {{ Environment().ClusterName }}</span>
          <span class="ml-4">命名空间: {{ Environment().Namespace }}</span>
        </span>
        <span v-else class="text-body-2 kubegems__role">
          项目角色:
          {{ $PROJECT_ROLE[m_permisson_projectRole] ? $PROJECT_ROLE[m_permisson_projectRole] : '暂无' }}
        </span>
      </v-sheet>
    </v-card-title>
  </v-card>
</template>

<script>
import BaseSelect from '@/mixins/select'
import BasePermission from '@/mixins/permission'
import { mapGetters, mapState } from 'vuex'
import BaseResource from '@/mixins/resource'

export default {
  name: 'BaseTenantHeader',
  mixins: [BaseSelect, BasePermission, BaseResource],
  inject: ['reload'],
  props: {
    environmented: {
      type: Boolean,
      default: () => true,
    },
    selectable: {
      type: Boolean,
      default: () => true,
    },
  },
  data: () => ({
    projectMenu: false,
    environmentMenu: false,
  }),
  computed: {
    ...mapState(['AdminViewport']),
    ...mapGetters(['Project', 'Environment', 'Tenant']),
  },
  methods: {
    async setProject(item) {
      if (this.environmented) {
        await this.m_select_projectEnvironmentSelectData(item.value)
        if (this.m_select_projectEnvironmentItems.length === 0) {
          this.$store.commit('SET_SNACKBAR', {
            text: '该项目下没有环境，请重新选择项目或添加环境',
            color: 'warning',
          })
          return
        } else {
          await this.$router.replace({
            params: {
              tenant: this.Tenant().TenantName,
              project: item.text,
              environment: this.m_select_projectEnvironmentItems[0].text,
            },
          })
        }
      } else {
        await this.$router.replace({
          params: {
            tenant: this.Tenant().TenantName,
            project: item.text,
          },
        })
      }
      this.reload()
    },
    async setEnvironment(item) {
      await this.$router.replace({
        params: {
          tenant: this.Tenant().TenantName,
          project: this.Project().ProjectName,
          environment: item.text,
        },
        query: {
          timestamp: Date.parse(new Date())
        }
      })
      this.reload()
    },
    toProject() {
      this.$store.commit('CLEAR_RESOURCEIRONMENT')
      this.$router.push({
        name: 'project-detail',
        params: {
          name: this.Project().ProjectName,
          tenant: this.Tenant().TenantName,
          project: this.Project().ProjectName,
        },
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.tenant-header__bg {
  z-index: auto !important;
}
</style>
