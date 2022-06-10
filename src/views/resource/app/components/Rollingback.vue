<template>
  <BaseDialog v-model="dialog" :width="800" title="回滚" icon="fas fa-redo-alt" @reset="reset">
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
                :headers="headers"
                :items="versions"
                :page.sync="params.page"
                :search.sync="search"
                :items-per-page="params.size"
                no-data-text="暂无数据"
                no-results-text="暂无匹配版本"
                hide-default-footer
                item-key="value"
                class="px-0"
                single-select
                show-select
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
      <v-btn class="float-right" color="primary" text :loading="Circular" @click="rollback"> 确定 </v-btn>
    </template>
  </BaseDialog>
</template>

<script>
  import { mapState, mapGetters } from 'vuex';
  import { getStrategyDeployStatus, postStrategyDeployEnvironmentAppsControl } from '@/api';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'Rollingback',
    mixins: [BaseResource],
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
      ...mapGetters(['Tenant', 'Project', 'Environment']),
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.dialog = true;
      },
      // eslint-disable-next-line vue/no-unused-properties
      init() {
        this.rsVersionList();
      },
      async rsVersionList() {
        this.versions = [];
        const data = await getStrategyDeployStatus(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          this.$route.params.name,
        );
        if (data && data.replicaSets) {
          data.replicaSets.map((r, index) => {
            if (index === 0) this.currentVersion = r.revision;
            this.versions.push({
              value: r.revision,
              createTime: r.objectMeta.creationTimestamp
                ? this.$moment(r.objectMeta.creationTimestamp).format('lll')
                : '',
              images: r.images,
            });
          });
        }
      },
      selectVersion({ item, value }) {
        if (value) {
          this.selectItem = item;
        } else {
          this.selectItem = null;
        }
      },
      rollback() {
        this.$store.commit('SET_CONFIRM', {
          title: '回滚',
          content: {
            text: `回滚版本 ${this.selectItem.value}`,
            type: 'confirm',
            name: this.$route.params.name,
          },
          param: {},
          doFunc: async () => {
            await postStrategyDeployEnvironmentAppsControl(
              this.Tenant().ID,
              this.Project().ID,
              this.Environment().ID,
              this.$route.params.name,
              {
                command: 'undo',
                args: {
                  revision: `${this.selectItem.value}`,
                },
              },
            );
            this.reset();
          },
        });
      },
      reset() {
        this.dialog = false;
        this.$refs.form.reset();
        this.selectItem = null;
      },
    },
  };
</script>
