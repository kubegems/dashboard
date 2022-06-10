<template>
  <v-form v-model="valid" lazy-validation class="my-2" @submit.prevent>
    <v-flex :class="expand ? 'kubegems__overlay' : ''" />
    <v-expand-transition>
      <v-card v-show="expand" class="my-2 pa-2 kubegems__expand-transition" :elevation="4">
        <v-card-text class="pa-0">
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
            <v-sheet class="pt-2 px-2">
              <v-flex class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width">
                <span>CPU</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.requests.cpu" required label="Reuqests" :rules="objRules.requestsCpuRule" />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.limits.cpu" required label="Limits" :rules="objRules.limitsCpuRule" />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
            <v-sheet class="px-2">
              <v-flex class="float-left text-subtitle-2 pt-6 primary--text kubegems__min-width">
                <span>内存</span>
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field
                  v-model="obj.requests.memory"
                  required
                  label="Requests"
                  :rules="objRules.requestsMemoryRule"
                />
              </v-flex>
              <v-flex class="float-left ml-2 kubegems__form-width">
                <v-text-field v-model="obj.limits.memory" required label="Limits" :rules="objRules.limitsMemoryRule" />
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-sheet>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-0">
          <v-spacer />
          <v-btn text small color="error" @click="closeCard"> 取消 </v-btn>
          <v-btn text small color="primary" @click="addData"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-expand-transition>

    <ResourceLimit :container-copy="containerCopy" @updateData="updateData" @removeData="removeData" />
  </v-form>
</template>

<script>
  import ResourceLimit from './ResourceLimit';
  import { deepCopy, sizeOfCpu, sizeOfStorage } from '@/utils/helpers';

  export default {
    name: 'ContainerResource',
    components: {
      ResourceLimit,
    },
    props: {
      container: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        valid: false,
        expand: false,
        obj: {
          requests: {
            cpu: '100m',
            memory: '128Mi',
          },
          limits: {
            cpu: 2,
            memory: '4Gi',
          },
        },
        containerCopy: null,
      };
    },
    computed: {
      objRules() {
        return {
          requestsCpuRule: [(v) => (!!new RegExp('^\\d+[m]?$').test(v) && parseInt(v) >= 0) || '格式错误(示例:1m,1)'],
          requestsMemoryRule: [
            (v) => (!!new RegExp('(^\\d+[M|G]i$)').test(v) && parseInt(v) >= 0) || '格式错误(示例:1Mi,1Gi)',
          ],
          limitsCpuRule: [
            (v) => (!!new RegExp('^\\d+[m]?$').test(v) && parseInt(v) >= 0) || '格式错误(示例:1m,1)',
            (v) => sizeOfCpu(v) >= sizeOfCpu(this.obj.requests.cpu) || 'Limits小于Requests',
          ],
          limitsMemoryRule: [
            (v) => (!!new RegExp('(^\\d+[M|G]i$)').test(v) && parseInt(v) >= 0) || '格式错误(示例:1Mi,1Gi)',
            (v) => sizeOfStorage(v) >= sizeOfStorage(this.obj.requests.memory) || 'Limits小于Requests',
          ],
        };
      },
    },
    watch: {
      container() {
        if (this.container) this.containerCopy = deepCopy(this.container);
        else this.containerCopy = {};
      },
    },
    mounted() {
      if (this.container) this.containerCopy = deepCopy(this.container);
      else this.containerCopy = {};
    },
    methods: {
      expandCard() {
        this.expand = true;
      },
      closeCard() {
        this.expand = false;
        this.obj = {
          requests: {
            cpu: '100m',
            memory: '128Mi',
          },
          limits: {
            cpu: 2,
            memory: '4Gi',
          },
        };
      },
      addData() {
        if (this.$refs.form.validate(true)) {
          this.$set(this.containerCopy, 'resources', this.obj);
          this.$emit('updateComponentData', this.containerCopy);
          this.closeCard();
        }
      },
      removeData() {
        this.$set(this.containerCopy, 'resources', null);
        this.$emit('updateComponentData', this.containerCopy);
      },
      updateData() {
        if (this.containerCopy && this.containerCopy.resources && this.containerCopy.resources.requests) {
          this.obj.requests = deepCopy(this.containerCopy.resources.requests);
        }
        if (this.containerCopy && this.containerCopy.resources && this.containerCopy.resources.limits) {
          this.obj.limits = deepCopy(this.containerCopy.resources.limits);
        }
        this.expandCard();
      },
    },
  };
</script>
