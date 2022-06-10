<template>
  <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
    <v-expand-transition>
      <v-card v-show="expand" class="mb-2 pa-2 kubegems__expand-transition" :elevation="4">
        <v-sheet class="pt-4 px-2">
          <v-flex class="float-left text-body-2 py-2 primary--text font-weight-medium kubegems__min-width">
            <span>容器CPU</span>
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.default.cpu"
              class="mt-0 pt-0"
              :rules="objRules.container.cpuDefaultMinRule"
              label="默认值"
              style="width: 120px"
            />
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.defaultRequest.cpu"
              class="mt-0 pt-0"
              :rules="objRules.container.cpuDefaultRequestMinRule"
              label="默认请求值"
              style="width: 120px"
            />
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.max.cpu"
              class="mt-0 pt-0"
              :rules="objRules.container.cpuMaxRule"
              label="限制值"
              style="width: 120px"
            />
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>

        <v-sheet class="pt-0 px-2">
          <v-flex class="float-left text-body-2 py-2 primary--text font-weight-medium kubegems__min-width">
            <span>容器内存</span>
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.default.memory"
              class="mt-0 pt-0"
              :rules="objRules.container.memoryDefaultRule"
              label="默认值"
              style="width: 120px"
            />
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.defaultRequest.memory"
              class="mt-0 pt-0"
              :rules="objRules.container.memoryDefaultRequestRule"
              label="默认请求值"
              style="width: 120px"
            />
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Container.max.memory"
              class="mt-0 pt-0"
              :rules="objRules.container.memoryMaxRule"
              label="限制值"
              style="width: 120px"
            />
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>

        <v-sheet class="pt-0 px-2">
          <v-flex class="float-left text-body-2 py-2 primary--text font-weight-medium kubegems__min-width">
            <span>容器组CPU</span>
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.Pod.max.cpu"
              class="mt-0 pt-0"
              :rules="objRules.pod.cpuMaxRule"
              label="限制值"
              style="width: 120px"
            />
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>

        <v-sheet class="pt-0 px-2">
          <v-flex class="float-left">
            <v-flex class="float-left text-body-2 py-2 primary--text font-weight-medium kubegems__min-width">
              <span>容器组内存</span>
            </v-flex>
            <v-flex class="float-left ml-2">
              <v-text-field
                v-model="obj.LimitRange.Pod.max.memory"
                class="mt-0 pt-0"
                :rules="objRules.pod.memoryMaxRule"
                label="限制值"
                style="width: 120px"
              />
            </v-flex>
            <v-flex class="float-left ml-2">
              <v-flex style="width: 120px" />
            </v-flex>
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>

        <v-sheet class="pt-0 px-2">
          <v-flex class="float-left text-body-2 py-2 primary--text font-weight-medium kubegems__min-width">
            <span>存储卷容量</span>
          </v-flex>
          <v-flex class="float-left ml-2">
            <v-text-field
              v-model="obj.LimitRange.PersistentVolumeClaim.max.storage"
              class="mt-0 pt-0"
              :rules="objRules.persistentVolumeClaim.storageMaxRule"
              label="限制值"
              style="width: 120px"
            />
          </v-flex>
          <div class="kubegems__clear-float" />
        </v-sheet>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn text small color="error" @click="closeCard"> 取消 </v-btn>
          <v-btn text small color="primary" @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>
  </v-form>
</template>

<script>
  import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'LimitRange',
    props: {
      data: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      valid: false,
      expand: false,
      obj: {
        LimitRange: {
          Container: {
            default: {
              cpu: '500m',
              memory: '1Gi',
            },
            defaultRequest: {
              cpu: '10m',
              memory: '10Mi',
            },
            min: {
              cpu: '0',
              memory: '0Mi',
            },
            max: {
              cpu: '24',
              memory: '48Gi',
            },
          },
          Pod: {
            min: {
              cpu: '0',
              memory: '0Mi',
            },
            max: {
              cpu: '48',
              memory: '64Gi',
            },
          },
          PersistentVolumeClaim: {
            min: {
              storage: '0Mi',
            },
            max: {
              storage: '1Ti',
            },
          },
        },
      },
    }),
    computed: {
      objRules() {
        return {
          container: {
            cpuDefaultMinRule: [(v) => !!new RegExp('^\\d+[m]?$').test(v) || '格式错误(示例:1m,1)'],
            cpuDefaultRequestMinRule: [(v) => !!new RegExp('^\\d+[m]?$').test(v) || '格式错误(示例:1m,1)'],
            cpuMaxRule: [
              (v) => !!new RegExp('^\\d+[m]?$').test(v) || '格式错误(示例:1m,1)',
              (v) =>
                sizeOfCpu(v) >= sizeOfCpu(this.obj.LimitRange.Container.defaultRequest.cpu) || 'Limits小于Requests',
            ],
            memoryDefaultRule: [(v) => !!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(v) || '格式错误(示例:1Mi,1Gi)'],
            memoryDefaultRequestRule: [(v) => !!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(v) || '格式错误(示例:1Mi,1Gi)'],
            memoryMaxRule: [
              (v) => !!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(v) || '格式错误(示例:1Mi,1Gi)',
              (v) =>
                sizeOfStorage(v) >= sizeOfStorage(this.obj.LimitRange.Container.defaultRequest.memory) ||
                'Limits小于Requests',
            ],
          },
          pod: {
            cpuMaxRule: [
              (v) => !!new RegExp('^\\d+[m]?$').test(v) || '格式错误(示例:1m,1)',
              (v) => sizeOfCpu(v) >= sizeOfCpu(this.obj.LimitRange.Pod.min.cpu) || 'Limits小于Requests',
            ],
            memoryMaxRule: [
              (v) => !!new RegExp('(^\\d+[M|G]i$)|(^0$)').test(v) || '格式错误(示例:1Mi,1Gi)',
              (v) => sizeOfStorage(v) >= sizeOfStorage(this.obj.LimitRange.Pod.min.memory) || 'Limits小于Requests',
            ],
          },
          persistentVolumeClaim: {
            storageMaxRule: [
              (v) => !!new RegExp('(^\\d+[K|M|G|T]i$)|(^0$)').test(v) || '格式错误(示例:1Ki,1Mi,1Gi,1Ti)',
              (v) =>
                sizeOfStorage(v) >= sizeOfStorage(this.obj.LimitRange.PersistentVolumeClaim.min.storage) ||
                'Limits小于Requests',
            ],
          },
        };
      },
    },
    watch: {
      data() {
        this.obj = deepCopy(this.data.data);
      },
    },
    mounted() {
      if (this.data) {
        this.obj = deepCopy(this.data.data);
      }
    },
    methods: {
      addData() {
        if (this.$refs.form.validate(true)) {
          const data = deepCopy(this.obj);
          this.$emit('addData', data);
        }
      },
      closeCard() {
        this.expand = false;
        if (this.data) {
          this.obj = deepCopy(this.data.data);
        }
        this.$emit('closeOverlay');
      },
    },
  };
</script>
