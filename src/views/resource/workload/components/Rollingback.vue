<template>
  <BaseDialog v-model="dialog" icon="fas fa-redo-alt" title="回滚" :width="800" @reset="reset">
    <template #content>
      <BaseSubTitle title="版本定义" />
      <v-card-text class="px-2 pb-0">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
          <v-sheet>
            <v-flex class="text-subtitle-1 mb-2">
              当前版本
              <span class="text-subtitle-2 primary--text">
                {{ currentVersion }}
              </span>
            </v-flex>

            <v-text-field v-model="search" class="mt-2 pt-0" hide-details prepend-inner-icon="mdi-magnify" />
            <v-sheet max-height="300px">
              <v-data-table
                class="px-0"
                :headers="headers"
                hide-default-footer
                item-key="value"
                :items="versions"
                :items-per-page="params.size"
                no-data-text="暂无数据"
                no-results-text="暂无匹配版本"
                :page.sync="params.page"
                :search.sync="search"
                show-select
                single-select
                @item-selected="selectVersion"
              >
                <template #[`item.images`]="{ item }">
                  <v-flex v-for="(image, index) in item ? item.images : []" :key="index">
                    {{ image }}
                  </v-flex>
                </template>
              </v-data-table>
            </v-sheet>
          </v-sheet>
        </v-form>
      </v-card-text>
    </template>
    <template #action>
      <v-btn class="float-right" color="primary" :loading="Circular" text @click="rollbackWorkload"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState } from 'vuex';

  import { getWorkloadVersionList, postRollbackWorkload } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'Rollingback',
    mixins: [BaseResource],
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      dialog: false,
      valid: false,
      versions: [],
      headers: [
        { text: '版本', value: 'value', align: 'start' },
        { text: '镜像', value: 'images', align: 'start' },
        { text: '发布时间', value: 'createTime', align: 'start' },
      ],
      search: '',
      params: {
        page: 1,
        size: 1000,
      },
      currentVersion: '',
      selectItem: null,
    }),
    computed: {
      ...mapState(['Circular']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      // eslint-disable-next-line vue/no-unused-properties
      init() {
        this.workloadVersionList();
      },
      async workloadVersionList() {
        this.versions = [];
        const data = await getWorkloadVersionList(
          this.ThisCluster,
          this.$route.query.namespace,
          this.$route.query.type,
          this.item.metadata.name,
        );
        data.map((d) => {
          if (!d.current) {
            this.versions.push({
              value: d.revision,
              createTime: d.createTime ? this.$moment(d.createTime).format('lll') : '',
              images: d.images,
            });
          } else {
            this.currentVersion = d.revision;
          }
        });
      },
      selectVersion({ item, value }) {
        if (value) {
          this.selectItem = item;
        } else {
          this.selectItem = null;
        }
      },
      async rollbackWorkload() {
        if (!this.selectItem) {
          this.$store.commit('SET_SNACKBAR', {
            text: '请选择回滚版本',
            color: 'warning',
          });
          return;
        }
        if (this.$refs.form.validate(true)) {
          await postRollbackWorkload(
            this.ThisCluster,
            this.$route.query.namespace,
            this.$route.query.type,
            this.item.metadata.name,
            {
              revision: this.selectItem.value,
            },
          );
          this.$emit('refresh');
          this.reset();
        }
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
        this.selectItem = null;
      },
    },
  };
</script>
