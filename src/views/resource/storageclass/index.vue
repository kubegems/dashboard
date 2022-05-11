<template>
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-row class="mt-0">
      <v-col
        v-for="(item, index) in items"
        :key="index"
        cols="3"
      >
        <v-card
          v-if="item.add"
          class="kubegems__full-height"
          min-height="156"
        >
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item
              three-line
              class="kubegems__full-height"
            >
              <v-list-item-content>
                <v-btn
                  text
                  block
                  color="primary"
                  class="text-h6"
                  @click="addStorageClass"
                >
                  <v-icon left>mdi-plus-box</v-icon>
                  创建存储类型
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
        <v-hover
          v-else
          #default="{ hover }"
        >
          <v-card
            class="mx-auto sc-pos"
            height="100%"
            :elevation="hover ? 5 : 0"
          >
            <v-list-item three-line>
              <v-list-item-avatar
                class="primary--text"
                tile
                size="80"
              >
                <Icon
                  v-if="
                    getIconName(item.provisioner) &&
                      getIconName(item.provisioner).indexOf('img:') === -1
                  "
                  :icon="getIconName(item.provisioner)"
                  style="width: 60px; height: 60px;"
                  class="ml-2"
                />
                <img
                  v-else
                  class="img"
                  :src="`/icon/${getIconName(item.provisioner).replaceAll(
                    'img:',
                    '',
                  )}`"
                />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a>{{ item.metadata.name }}</a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  供应商：{{ item.provisioner }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-card-actions>
              <v-spacer />
              <v-btn
                text
                small
                color="primary"
                @click="updateStorageClass(item)"
              >
                编 辑
              </v-btn>
              <v-btn
                text
                small
                color="error"
                @click="removeStorageClass(item)"
              >
                删 除
              </v-btn>
            </v-card-actions>
            <v-flex
              v-if="
                item.metadata.annotations &&
                  item.metadata.annotations[
                    'storageclass.kubernetes.io/is-default-class'
                  ] &&
                  item.metadata.annotations[
                    'storageclass.kubernetes.io/is-default-class'
                  ] === 'true'
              "
              class="sc-watermark-bg"
            />
            <v-flex
              v-if="
                item.metadata.annotations &&
                  item.metadata.annotations[
                    'storageclass.kubernetes.io/is-default-class'
                  ] &&
                  item.metadata.annotations[
                    'storageclass.kubernetes.io/is-default-class'
                  ] === 'true'
              "
              class="sc-watermark font-weight-medium"
            >
              默认存储
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>

    <AddStorageClass
      ref="addStorageClass"
      @refresh="storageClassList"
    />
    <UpdateStorageClass
      ref="updateStorageClass"
      @refresh="storageClassList"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import { getStorageClassList, deleteStorageClass } from '@/api'
import AddStorageClass from './components/AddStorageClass'
import UpdateStorageClass from './components/UpdateStorageClass'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'
import BaseFilter from '@/mixins/base_filter'

export default {
  name: 'StorageClass',
  components: {
    AddStorageClass,
    UpdateStorageClass,
  },
  mixins: [BaseFilter, BaseResource, BasePermission],
  data: () => ({
    items: [],
  }),
  computed: {
    ...mapState(['JWT']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        if (this.ThisCluster === '') {
          this.$store.commit('SET_SNACKBAR', {
            text: `请创建或选择集群`,
            color: 'warning',
          })
          return
        }
        this.storageClassList()
      })
    }
  },
  methods: {
    async storageClassList() {
      const data = await getStorageClassList(this.ThisCluster, {
        size: 1000,
      })
      this.items = data.List
      this.items.push({ add: true })
    },
    addStorageClass() {
      this.$refs.addStorageClass.open()
    },
    updateStorageClass(item) {
      this.$refs.updateStorageClass.init(item)
      this.$refs.updateStorageClass.open()
    },
    removeStorageClass(item) {
      this.$store.commit('SET_CONFIRM', {
        title: `删除存储类型`,
        content: {
          text: `删除存储类型 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deleteStorageClass(this.ThisCluster, param.item.metadata.name)
          this.storageClassList()
        },
      })
    },
    getIconName(provisioner) {
      if (provisioner) {
        if (provisioner.indexOf('ceph') > -1) return 'img:ceph.png'
        if (provisioner.indexOf('openebs') > -1) return 'img:openebs.png'
        if (provisioner.indexOf('rancher') > -1) return 'logos:rancher-icon'
        if (provisioner.indexOf('gluster') > -1) return 'img:glusterfs.png'
        if (provisioner.indexOf('azure') > -1) return 'logos:azure-icon'
        if (provisioner.indexOf('aws') > -1) return 'logos:aws'
        if (provisioner.indexOf('cinder') > -1) return 'logos:openstack-icon'
        if (provisioner.indexOf('gce') > -1) return 'logos:google-cloud'
        if (provisioner.indexOf('longhorn') > -1) return 'img:longhorn.png'
        if (provisioner.indexOf('carina') > -1) return 'img:carina.jpeg'
      }
      return 'carbon:block-storage'
    },
  },
}
</script>

<style lang="scss" scoped>
.img {
  width: 60px;
  height: 60px;
  margin-left: 8px;
}

.sc-pos {
  position: relative;
  background-color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sc-watermark-bg {
  position: absolute;
  width: 120px;
  height: 90px;
  transform: rotate(47deg);
  top: -46px;
  right: -55px;
  background-color: #1e88e5;
  padding: 0;
}

.sc-watermark {
  position: absolute;
  top: 17px;
  right: 1px;
  transform: rotate(47deg);
  text-transform: uppercase;
  color: white;
  font-size: 12px;
}
</style>
