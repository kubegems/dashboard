<template>
  <v-container fluid>
    <BaseViewportHeader :selectable="false" />
    <BaseBreadcrumb>
      <template #extend>
        <v-flex class="kubegems__full-right">
          <v-btn
            v-if="m_permisson_resourceAllow"
            text
            small
            class="primary--text"
            @click="scalePersistentVolumeClaim"
          >
            <v-icon
              left
              small
            >
              fas fa-arrows-alt-v
            </v-icon>
            扩容存储卷
          </v-btn>
          <v-btn
            text
            small
            class="primary--text"
            @click="resourceYaml"
          >
            <v-icon
              left
              small
            >
              fas fa-code
            </v-icon>
            Yaml
          </v-btn>
          <v-menu
            v-if="m_permisson_resourceAllow"
            left
          >
            <template #activator="{ on }">
              <v-btn icon>
                <v-icon
                  x-small
                  color="primary"
                  v-on="on"
                >
                  fas fa-ellipsis-v
                </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-text class="pa-2 text-center">
                <v-flex>
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="updatePersistentVolumeClaim"
                  >
                    编辑
                  </v-btn>
                </v-flex>
                <v-flex
                  v-if="
                    pvc &&
                      pvc.metadata.annotations &&
                      pvc.metadata.annotations['storage.kubegems.io/allow-snapshot'] &&
                      pvc.metadata.annotations['storage.kubegems.io/allow-snapshot'] ===
                      'true'
                  "
                >
                  <v-btn
                    color="primary"
                    text
                    small
                    @click="addVolumeSnapshot"
                  >
                    创建快照
                  </v-btn>
                </v-flex>
                <v-flex>
                  <v-btn
                    color="error"
                    text
                    small
                    @click="removePersistentVolumeClaim"
                  >
                    删除
                  </v-btn>
                </v-flex>
              </v-card-text>
            </v-card>
          </v-menu>
        </v-flex>
      </template>
    </BaseBreadcrumb>
    <v-row class="mt-0">
      <v-col
        cols="2"
        class="pt-0"
      >
        <BasicResourceInfo :item="pvc" />
      </v-col>
      <v-col
        cols="10"
        class="pt-0"
      >
        <v-card>
          <v-card-text class="pa-0">
            <v-tabs
              v-model="tab"
              class="rounded-t pa-3"
            >
              <v-tab
                v-for="item in tabItems"
                :key="item.value"
              >
                {{ item.text }}
              </v-tab>
            </v-tabs>
          </v-card-text>
        </v-card>
        <component
          :is="tabItems[tab].value"
          :ref="tabItems[tab].value"
          class="mt-3"
          :item="pvc"
          :selector="{
            topkind: 'PersistentVolumeClaim',
            topname: pvc ? pvc.metadata.name : '',
          }"
        />
      </v-col>
    </v-row>

    <ResourceYaml
      ref="resourceYaml"
      :item="pvc"
    />
    <UpdatePersistentVolumeClaim
      ref="updatePersistentVolumeClaim"
      @refresh="persistentVolumeClaimDetail"
    />
    <ScalePersistentVolumeClaim
      ref="scalePersistentVolumeClaim"
      @refresh="persistentVolumeClaimDetail"
    />
  </v-container>
</template>

<script>
import { mapState } from 'vuex'
import {
  getPersistentVolumeClaimDetail,
  deletePersistentVolumeClaim,
  postAddVolumeSnapshot,
} from '@/api'
import ScalePersistentVolumeClaim from './components/ScalePersistentVolumeClaim'
import PersistentVolumeClaimMonitor from './components/PersistentVolumeClaimMonitor'
import ResourceInfo from './components/ResourceInfo'
import Metadata from '@/views/resource/components/metadata/Metadata'
import EventList from '@/views/resource/components/common/EventList'
import ResourceYaml from '@/views/resource/components/common/ResourceYaml'
import BasicResourceInfo from '@/views/resource/components/common/BasicResourceInfo'
import UpdatePersistentVolumeClaim from './components/UpdatePersistentVolumeClaim'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'

export default {
  name: 'PersistentVolumeClaimDetail',
  components: {
    PersistentVolumeClaimMonitor,
    ResourceInfo,
    Metadata,
    EventList,
    ResourceYaml,
    BasicResourceInfo,
    UpdatePersistentVolumeClaim,
    ScalePersistentVolumeClaim,
  },
  mixins: [BaseResource, BasePermission],
  data: () => ({
    pvc: null,
    tab: 0,
    tabItems: [
      { text: '资源信息', value: 'ResourceInfo' },
      { text: '元数据', value: 'Metadata' },
      { text: '事件', value: 'EventList' },
      { text: '监控', value: 'PersistentVolumeClaimMonitor' },
    ],
  }),
  computed: {
    ...mapState(['JWT']),
  },
  mounted() {
    if (this.JWT) {
      this.$nextTick(() => {
        this.persistentVolumeClaimDetail()
      })
    }
  },
  methods: {
    async persistentVolumeClaimDetail() {
      const data = await getPersistentVolumeClaimDetail(
        this.ThisCluster,
        this.$route.query.namespace,
        this.$route.params.name,
      )
      this.pvc = data
    },
    resourceYaml() {
      this.$refs.resourceYaml.open()
    },
    updatePersistentVolumeClaim() {
      this.$refs.updatePersistentVolumeClaim.init(this.pvc)
      this.$refs.updatePersistentVolumeClaim.open()
    },
    addVolumeSnapshot() {
      const item = this.pvc
      this.$store.commit('SET_CONFIRM', {
        title: '创建存储卷快照',
        content: {
          text: `创建存储卷快照 ${item.metadata.name}`,
          type: 'confirm',
        },
        param: { item },
        doFunc: async (param) => {
          if (param.item.metadata.name.length > 0) {
            await postAddVolumeSnapshot(
              this.ThisCluster,
              param.item.metadata.namespace,
              {
                persistentVolumeClaimName: param.item.metadata.name,
              },
            )
          }
        },
      })
    },
    scalePersistentVolumeClaim() {
      this.$refs.scalePersistentVolumeClaim.init(this.pvc)
      this.$refs.scalePersistentVolumeClaim.open()
    },
    removePersistentVolumeClaim() {
      const item = this.pvc
      this.$store.commit('SET_CONFIRM', {
        title: `删除存储卷`,
        content: {
          text: `删除存储卷 ${item.metadata.name}`,
          type: 'delete',
          name: item.metadata.name,
        },
        param: { item },
        doFunc: async (param) => {
          await deletePersistentVolumeClaim(
            this.ThisCluster,
            this.$route.query.namespace,
            param.item.metadata.name,
          )
          this.$router.push({ name: 'persistentvolumeclaim-list', params: this.$route.params })
        },
      })
    },
  },
}
</script>
