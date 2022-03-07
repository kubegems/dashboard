<template>
  <v-flex>
    <BaseSubTitle title="镜像仓库定义" />
    <v-card-text class="pa-2">
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
      >
        <v-sheet>
          <v-switch
            v-model="obj.EnableExtends"
            class="mb-4"
            hide-details
            label="启用镜像扫描和分析报告"
          />
          <v-text-field
            v-model="obj.RegistryName"
            class="my-0"
            required
            label="仓库名称"
            :rules="objRules.RegistryNameRules"
            :readonly="edit"
          />
          <v-autocomplete
            v-if="AdminViewport"
            v-model="obj.ProjectID"
            color="primary"
            label="项目"
            hide-selected
            class="my-0"
            no-data-text="暂无可选数据"
            :items="m_select_projectItems"
            :rules="objRules.ProjectRules"
            @focus="onProjectSelectFocus"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
                class="mx-1"
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
          <v-flex>
            <v-row>
              <v-col
                cols="3"
                class="pr-0"
              >
                <v-menu
                  v-model="prefixscheme"
                  bottom
                  right
                  offset-y
                  origin="top center"
                  transition="scale-transition"
                  nudge-bottom="5px"
                  :close-on-content-click="false"
                  content-class="tag-menu"
                >
                  <template #activator="{ on }">
                    <v-chip
                      label
                      color="white"
                      class="primary--text float-left mt-3 font-weight-medium"
                      v-on="on"
                    >
                      {{ scheme.toLocaleUpperCase() }}
                      <v-icon
                        v-if="prefixscheme"
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
                  <v-data-iterator
                    :items="[{ text: 'scheme', values: ['http', 'https'] }]"
                    hide-default-footer
                  >
                    <template #default="props">
                      <v-card
                        v-for="iterdata in props.items"
                        :key="iterdata.text"
                      >
                        <v-list dense>
                          <v-list-item
                            v-for="(prefixscheme, index) in iterdata.values"
                            :key="index"
                            class="text-body-2 text-center"
                            link
                            :style="
                              prefixscheme === scheme
                                ? `color: #1e88e5 !important;`
                                : ``
                            "
                            @click="setScheme(prefixscheme)"
                          >
                            <v-list-item-content>
                              <span>
                                {{ prefixscheme.toLocaleUpperCase() }}
                              </span>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </template>
                  </v-data-iterator>
                </v-menu>
              </v-col>
              <v-col
                cols="9"
                class="pl-0"
              >
                <v-text-field
                  v-model="obj.RegistryAddress"
                  class="my-0"
                  required
                  label="仓库地址"
                  :rules="objRules.RegistryAddressRules"
                />
              </v-col>
            </v-row>
          </v-flex>
          <v-text-field
            v-model="obj.Username"
            class="my-0"
            required
            label="用户名"
            :rules="objRules.UsernameRules"
          />
          <v-text-field
            v-model="obj.Password"
            class="my-0"
            required
            label="密码"
            :rules="objRules.PasswordRules"
            type="password"
          />
        </v-sheet>
      </v-form>
    </v-card-text>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import BaseSelect from '@/mixins/select'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'
import { k8sName, required } from '@/utils/rules'

export default {
  name: 'RegistryBaseForm',
  mixins: [BaseSelect, BaseResource],
  props: {
    edit: {
      type: Boolean,
      default: () => false,
    },
  },
  data: () => ({
    valid: false,
    prefixscheme: false,
    scheme: 'http',
    obj: {
      RegistryName: '',
      RegistryAddress: '',
      Username: '',
      Password: '',
      UpdateTime: new Date(),
      CreatorID: 0,
      ProjectID: 0,
      IsDefault: false,
      EnableExtends: false,
    },
  }),
  computed: {
    ...mapState(['Circular', 'User', 'AdminViewport']),
    ...mapGetters(['Project']),
    objRules() {
      return {
        RegistryNameRules: [
          required,
          k8sName,
        ],
        RegistryAddressRules: [required],
        UsernameRules: [required],
        PasswordRules: [required],
        ProjectRules: [required],
      }
    },
  },
  mounted() {
    if (!this.AdminViewport) {
      this.obj.ProjectID = this.Project().ID
    } else {
      this.m_select_projectSelectData()
    }
    this.obj.CreatorID = this.User.ID
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    generateData() {
      const obj = deepCopy(this.obj)
      obj.RegistryAddress = `${this.scheme}://${obj.RegistryAddress}`
      return obj
    },
    setScheme(scheme) {
      this.scheme = scheme
      this.prefixscheme = false
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
    },
    // eslint-disable-next-line vue/no-unused-properties
    setData(data) {
      this.obj = data
    },
    onProjectSelectFocus() {
      this.m_select_projectSelectData()
    },
  },
}
</script>
