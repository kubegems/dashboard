<template>
  <v-form
    ref="form"
    v-model="valid"
    lazy-validation
  >
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card
        v-show="expand"
        class="my-2 pa-2 kubegems__expand-transition"
        :elevation="4"
      >
        <v-card-text class="pa-0">
          <v-form
            v-model="valid"
            lazy-validation
          >
            <v-sheet class="pt-2 px-2">
              <v-flex
                class="float-left text-subtitle-2 pt-5 primary--text kubegems__min-width"
              >
                <span>卷挂载定义</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-autocomplete
                  v-model="volumeType"
                  color="primary"
                  :items="volumeTypes"
                  label="类型"
                  hide-selected
                  class="my-0"
                  no-data-text="暂无可选数据"
                  :readonly="componentEdit"
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
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <component
              :is="volumeType + 'Mount'"
              v-if="volumeType"
              :ref="volumeType + 'Mount'"
              :containers="obj.spec.jobTemplate.spec.template.spec.containers"
              :namespace="obj.metadata.namespace ? obj.metadata.namespace : ''"
              :volume-mount-name="volumeMountName"
              :volume="volume"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn
            text
            small
            color="error"
            @click="closeCard"
          >
            取消
          </v-btn>
          <v-btn
            text
            small
            color="primary"
            @click="addData"
          >
            保存
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>

    <BaseSubTitle title="存储卷" />
    <v-card-text class="pa-2">
      <StorageMountItem
        :volumes="obj.spec.jobTemplate.spec.template.spec.volumes"
        :containers="obj.spec.jobTemplate.spec.template.spec.containers"
        :pvcs="pvcs"
        @updateData="updateData"
        @removeData="removeData"
        @expandCard="expandCard"
      />
    </v-card-text>
  </v-form>
</template>

<script>
import { getPersistentVolumeClaimDetail, getAppResourceFileMetas } from '@/api'
import ConfigMapMount from '@/views/resource/workload/components/WorkloadBaseForm/StorageMount/volume_section/ConfigMapMount'
import HostPathMount from '@/views/resource/workload/components/WorkloadBaseForm/StorageMount/volume_section/HostPathMount'
import SecretMount from '@/views/resource/workload/components/WorkloadBaseForm/StorageMount/volume_section/SecretMount'
import PersistentVolumeClaimMount from '@/views/resource/workload/components/WorkloadBaseForm/StorageMount/volume_section/PersistentVolumeClaimMount'
import StorageMountItem from '@/views/resource/workload/components/WorkloadBaseForm/StorageMount/StorageMountItem'
import BaseResource from '@/mixins/resource'
import { deepCopy } from '@/utils/helpers'

export default {
  name: 'StorageMount',
  components: {
    ConfigMapMount,
    HostPathMount,
    SecretMount,
    PersistentVolumeClaimMount,
    StorageMountItem,
  },
  mixins: [BaseResource],
  data() {
    return {
      valid: false,
      volumeTypes: [
        { text: '存储卷', value: 'PersistentVolumeClaim' },
        { text: 'HostPath', value: 'HostPath' },
        { text: '配置', value: 'ConfigMap' },
        { text: '密钥', value: 'Secret' },
      ],
      volumeType: null,
      volumeMountName: null,
      volume: null,
      componentEdit: false,
      editIndex: -1,
      obj: {
        metadata: {},
        spec: {
          jobTemplate: {
            spec: {
              template: {
                spec: {
                  volumes: [],
                  containers: [],
                },
              },
            },
          },
        },
      },
      pvcs: {},
      expand: false,
    }
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    async init(data) {
      this.$nextTick(async () => {
        this.obj = this.$_.merge(deepCopy(data), this.obj)
        await this.persistentVolumeClaimDetail()
      })
    },
    // eslint-disable-next-line vue/no-unused-properties
    async back(data) {
      this.$nextTick(async () => {
        this.obj = deepCopy(data)
        await this.persistentVolumeClaimDetail()
      })
    },
    async persistentVolumeClaimDetail() {
      if (this.manifest) {
        const data = await getAppResourceFileMetas(
          this.$route.query.tenantid,
          this.$route.query.projectid,
          this.ThisAppEnvironmentID,
          this.$route.params.name,
          { kind: 'PersistentVolumeClaim' },
        )
        const pvcDict = {}
        data.forEach((pvc) => {
          pvcDict[pvc.metadata.name] = pvc
        })
        this.obj.spec.jobTemplate.spec.template.spec.volumes.forEach(
          async (volume) => {
            if (volume.persistentVolumeClaim) {
              this.$set(
                this.pvcs,
                volume.persistentVolumeClaim.claimName,
                pvcDict[volume.persistentVolumeClaim.claimName],
              )
            }
          },
        )
      } else {
        this.obj.spec.jobTemplate.spec.template.spec.volumes.forEach(
          async (volume) => {
            if (volume.persistentVolumeClaim) {
              const data = await getPersistentVolumeClaimDetail(
                this.ThisCluster,
                this.obj.metadata.namespace ? this.obj.metadata.namespace : '',
                volume.persistentVolumeClaim.claimName,
              )
              this.$set(this.pvcs, volume.persistentVolumeClaim.claimName, data)
            }
          },
        )
      }
    },
    addData() {
      if (this.volumeType) {
        const data = this.$refs[`${this.volumeType}Mount`].generateData()
        if (!this.obj.spec.jobTemplate.spec.template.spec.volumes) {
          this.obj.spec.jobTemplate.spec.template.spec.volumes = []
        }
        let vIndex = this.editIndex
        if (vIndex === -1) {
          vIndex =
            this.obj.spec.jobTemplate.spec.template.spec.volumes.findIndex(
              (v) => {
                return data && v.name === data.volume.name
              },
            )
        }
        if (!this.obj.spec.jobTemplate.spec.template.spec.volumes) {
          this.obj.spec.jobTemplate.spec.template.spec.volumes = []
        }
        if (vIndex === -1 || this.volume === null) {
          this.obj.spec.jobTemplate.spec.template.spec.volumes.push(data.volume)
        } else {
          this.$set(
            this.obj.spec.jobTemplate.spec.template.spec.volumes,
            vIndex,
            data.volume,
          )
        }

        this.obj.spec.jobTemplate.spec.template.spec.containers.forEach(
          (c, i) => {
            if (!c.volumeMounts) c.volumeMounts = []
            const mIndex = c.volumeMounts.findIndex((v) => {
              return v.name === data.volumeMount[c.name].name
            })
            if (mIndex === -1 || this.volume === null) {
              if (
                data.volumeMount[c.name] &&
                data.volumeMount[c.name].mountPath &&
                data.volumeMount[c.name].mountPath.trim().length > 0
              ) {
                c.volumeMounts.push(data.volumeMount[c.name])
                this.$set(
                  this.obj.spec.jobTemplate.spec.template.spec.containers,
                  i,
                  c,
                )
              }
            } else {
              if (data.volumeMount[c.name].readOnly !== null) {
                if (
                  data.volumeMount[c.name] &&
                  data.volumeMount[c.name].mountPath &&
                  data.volumeMount[c.name].mountPath.trim().length > 0
                ) {
                  c.volumeMounts[mIndex] = data.volumeMount[c.name]
                  this.$set(
                    this.obj.spec.jobTemplate.spec.template.spec.containers,
                    i,
                    c,
                  )
                }
              } else {
                this.$delete(c.volumeMounts, mIndex)
                this.$set(
                  this.obj.spec.jobTemplate.spec.template.spec.containers,
                  i,
                  c,
                )
              }
            }
          },
        )
        this.persistentVolumeClaimDetail()
        this.closeCard()
      }
    },
    updateData(index) {
      const volume = this.obj.spec.jobTemplate.spec.template.spec.volumes[index]
      this.editIndex = index
      if (volume.persistentVolumeClaim) {
        this.volumeMountName = volume.name
        this.volume = deepCopy(volume)
        this.volumeType = 'PersistentVolumeClaim'
        this.expandCard(true)
      } else if (volume.configMap) {
        this.volumeMountName = volume.name
        this.volume = deepCopy(volume)
        this.volumeType = 'ConfigMap'
        this.expandCard(true)
      } else if (volume.secret) {
        this.volumeMountName = volume.name
        this.volume = deepCopy(volume)
        this.volumeType = 'Secret'
        this.expandCard(true)
      } else if (volume.hostPath) {
        this.volumeMountName = volume.name
        this.volume = deepCopy(volume)
        this.volumeType = 'HostPath'
        this.expandCard(true)
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '未知的卷类型',
          color: 'warning',
        })
      }
    },
    removeData(index) {
      const volume = this.obj.spec.jobTemplate.spec.template.spec.volumes[index]
      this.$delete(this.obj.spec.template.spec.volumes, index)
      this.obj.spec.jobTemplate.spec.template.spec.containers.forEach((c) => {
        if (c.volumeMounts) {
          const vindex = c.volumeMounts.findIndex((v) => {
            return v.name === volume.name
          })
          if (vindex > -1) {
            this.$delete(c.volumeMounts, vindex)
          }
        }
      })
    },
    expandCard(componentEdit = false) {
      if (!componentEdit) {
        this.volumeType = 'PersistentVolumeClaim'
        this.editIndex = -1
      }
      this.$nextTick(() => {
        this.componentEdit = componentEdit
        this.expand = true
      })
    },
    closeCard() {
      this.expand = false
      this.reset()
      this.volumeType = ''
      this.volumeMountName = null
      this.volume = null
      this.componentEdit = false
      this.editIndex = -1
    },
    reset() {
      this.$refs.form.reset()
    },
  },
}
</script>
