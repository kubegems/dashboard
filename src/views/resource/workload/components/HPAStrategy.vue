<template>
  <BaseDialog v-model="dialog" :width="500" title="弹性伸缩设置" icon="fas fa-cogs" @reset="reset">
    <template #content>
      <BaseSubTitle title="弹性伸缩定义">
        <template #action>
          <v-btn v-if="obj.exist" small text color="primary" class="float-right mr-2" @click="removeHPA">
            <v-icon left small> mdi-delete </v-icon>
            清除弹性伸缩策略
          </v-btn>
        </template>
      </BaseSubTitle>
      <v-card-text class="px-2 pb-0">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-text-field
              v-model="obj.cpu"
              class="my-0"
              required
              label="最大CPU使用率"
              suffix="%"
              :rules="objRules.cpuRules"
            />
            <v-text-field
              v-model="obj.memory"
              class="my-0"
              required
              label="最大内存使用率"
              suffix="%"
              :rules="objRules.memoryRules"
            />
            <v-text-field
              v-model="obj.min_replicas"
              class="my-0"
              required
              :rules="objRules.min_replicasRules"
              label="最小副本数"
              type="number"
            />
            <v-text-field
              v-model="obj.max_replicas"
              class="my-0"
              required
              :rules="objRules.max_replicasRules"
              label="最大副本数"
              type="number"
            />
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="setHPA"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';
  import { postSetHpa, getHpaDetail, deleteHpa } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'HPAStrategy',
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
      kind: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      dialog: false,
      valid: false,
      obj: {
        cluster: '',
        kind: '',
        name: '',
        namespace: '',
        cpu: '',
        max_replicas: 0,
        memory: '',
        min_replicas: 0,
      },
    }),
    computed: {
      ...mapState(['Circular']),
      objRules() {
        return {
          cpuRules: [
            (v) => {
              if (v !== '') {
                if (!new RegExp('^\\d+$').test(v)) {
                  return '数字格式错误';
                } else {
                  if (parseInt(v) < 0) return '小于最小限制';
                  if (parseInt(v) > 100) return '大于最大限制';
                  return true;
                }
              } else if (this.obj.cpu === '' && this.obj.memory === '') {
                return '最大CPU使用率,最大内存使用率必填一项';
              }
              return true;
            },
          ],
          memoryRules: [
            (v) => {
              if (v !== '') {
                if (!new RegExp('^\\d+$').test(v)) {
                  return '数字格式错误';
                } else {
                  if (parseInt(v) < 0) return '小于最小限制';
                  if (parseInt(v) > 100) return '大于最大限制';
                  return true;
                }
              } else if (this.obj.cpu === '' && this.obj.memory === '') {
                return '最大CPU使用率,最大内存使用率必填一项';
              }
              return true;
            },
          ],
          min_replicasRules: [(v) => parseInt(v) >= 0 || '小于最小限制'],
          max_replicasRules: [
            (v) => parseInt(v) >= 0 || '小于最小限制',
            (v) => parseInt(this.obj.min_replicas) < parseInt(v) || '最小副本数超过最大副本数',
          ],
        };
      },
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      async setHPA() {
        if (this.$refs.form.validate(true)) {
          this.obj.cpu = this.obj.cpu !== '' ? parseInt(this.obj.cpu) : null;
          this.obj.memory = this.obj.memory !== '' ? parseInt(this.obj.memory) : null;
          this.obj.min_replicas = parseInt(this.obj.min_replicas);
          this.obj.max_replicas = parseInt(this.obj.max_replicas);
          await postSetHpa(this.obj.cluster, this.obj.namespace, this.obj);
          this.reset();
        }
      },
      async hpaDetail() {
        this.obj.cluster = this.ThisCluster;
        this.obj.kind = this.kind !== '' ? this.kind : this.$route.query.type;
        this.obj.name = this.item.metadata.name;
        this.obj.namespace = this.item.metadata.namespace;
        const data = await getHpaDetail(this.obj.cluster, this.obj.namespace, this.obj);
        if (data.exist) {
          this.obj = data;
          if (this.obj.cpu === 0) this.obj.cpu = '';
          if (this.obj.memory === 0) this.obj.memory = '';
        } else {
          this.obj.min_replicas = 0;
          this.obj.max_replicas = 0;
          this.$refs.form.resetValidation();
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      async init() {
        await this.hpaDetail();
      },
      async removeHPA() {
        this.$store.commit('SET_CONFIRM', {
          title: '清除弹性伸缩策略',
          content: { text: '清除弹性伸缩策略', type: 'confirm' },
          param: {},
          doFunc: async () => {
            if (this.obj.name.length > 0) {
              await deleteHpa(
                this.ThisCluster,
                this.obj.namespace,
                `hpa-${
                  this.kind !== ''
                    ? this.kind === 'Deployment'
                      ? 'dep'
                      : 'sts'
                    : this.$route.query.type === 'Deployment'
                    ? 'dep'
                    : 'sts'
                }-${this.obj.name}`,
              );
            }
            this.reset();
          },
        });
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
      },
    },
  };
</script>
