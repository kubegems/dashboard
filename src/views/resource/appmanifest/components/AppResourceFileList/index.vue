<template>
  <v-card class="pl-2">
    <v-row class="mt-3">
      <v-col class="col-position" cols="4">
        <v-treeview
          ref="manifestTree"
          v-model="tree"
          activatable
          :active="active"
          class="text-body-2"
          dense
          item-key="name"
          :items="items"
          :open="[app ? app.name : '']"
          open-on-click
          rounded
          @update:active="showManifest"
        >
          <template #prepend="{ item }">
            <v-icon v-if="!item.kind"> mdi-apps </v-icon>
            <v-flex v-else>
              <v-flex class="primary white--text rounded chip float-left mt-0" color="primary">
                {{
                  $APP_MENIFEST_TAG[item.kind] && $APP_MENIFEST_TAG[item.kind].value
                    ? $APP_MENIFEST_TAG[item.kind].value
                    : item.kind
                }}
              </v-flex>
              <v-flex class="float-left ml-2 mt-n1">
                <v-icon v-if="!item.completed" color="orange" small> fas fa-exclamation </v-icon>
              </v-flex>
              <div class="kubegems__clear-float" />
            </v-flex>
          </template>
          <template #append="{ item }">
            <v-btn
              v-if="!item.kind && m_permisson_resourceAllow"
              color="primary"
              small
              text
              @click.stop="addResourceFile"
            >
              添加资源
            </v-btn>
            <v-btn v-if="!item.kind" color="primary" small text @click.stop="viewHistoryVersion"> 历史版本 </v-btn>
            <v-btn v-if="!item.kind" color="primary" small text @click.stop="refreshResource"> 刷新 </v-btn>
            <v-menu v-else-if="m_permisson_resourceAllow" left>
              <template #activator="{ on }">
                <v-btn icon>
                  <v-icon color="primary" x-small v-on="on"> fas fa-ellipsis-v </v-icon>
                </v-btn>
              </template>
              <v-card>
                <v-card-text class="pa-2">
                  <v-flex>
                    <v-btn color="primary" small text @click="updateResourceFile(item)"> 编辑 </v-btn>
                  </v-flex>
                  <v-flex>
                    <v-btn color="error" small text @click="removeResourceFile(item)"> 删除 </v-btn>
                  </v-flex>
                </v-card-text>
              </v-card>
            </v-menu>
          </template>
        </v-treeview>
        <v-flex v-if="m_permisson_resourceAllow && Environment().ID > 0" class="sync-btn mx-3">
          <v-btn block color="primary" text @click="syncAppResource">
            <v-icon left>mdi-sync</v-icon>
            同步
          </v-btn>
        </v-flex>
      </v-col>
      <v-col class="pr-6" cols="8">
        <AppResourceFileHistory v-if="historyView" :app="app" @refresh="refresh" />
        <ACEEditor
          v-else
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')} rounded`"
          :height="height"
          lang="yaml"
          :options="Object.assign($aceOptions, { readOnly: true, wrap: true })"
          theme="chrome"
          :value="manifest"
          @init="$aceinit"
          @keydown.stop
        />
      </v-col>
    </v-row>

    <AddResourceFile ref="addResourceFile" @refresh="refresh" />
    <UpdateResourceFile ref="updateResourceFile" @refresh="refresh" />
  </v-card>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import AddResourceFile from './AddResourceFile';
  import AppResourceFileHistory from './AppResourceFileHistory';
  import UpdateResourceFile from './UpdateResourceFile';

  import { getAppResourceFiles, deleteAppResourceFile, postSyncAppResource, postRefreshAppResource } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AppResourceFileList',
    components: {
      AddResourceFile,
      AppResourceFileHistory,
      UpdateResourceFile,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      app: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      tree: [],
      active: [],
      activeFile: '',
      items: [],
      historyView: false,
    }),
    computed: {
      ...mapState(['Scale']),
      ...mapGetters(['Project', 'Tenant', 'Environment']),
      height() {
        return window.innerHeight - parseInt(302 * this.Scale) - 12;
      },
      manifest() {
        if (this.items.length > 0) {
          const file = this.items[0].children.find((f) => {
            return f.name === this.activeFile;
          });
          if (file) {
            return file.manifest;
          }
          return '';
        }
        return '';
      },
    },
    watch: {
      app() {
        this.$nextTick(() => {
          this.appResourceFiles();
        });
      },
    },
    mounted() {
      if (this.app) {
        this.$nextTick(() => {
          this.appResourceFiles();
        });
      }
    },
    methods: {
      async appResourceFiles() {
        const data = await getAppResourceFiles(
          this.app.TenantID,
          this.app.ProjectID,
          this.ThisAppEnvironmentID,
          this.app.name,
          {
            noprocessing: true,
          },
        );

        if (data) {
          this.items = [];
          const files = [];
          data.forEach((d) => {
            if (
              !['kustomization.yaml', 'kustomize.yaml', 'kustomization.yml', 'kustomize.yml'].includes(d.name) &&
              (d.name.endsWith('.yaml') || d.name.endsWith('.yml'))
            ) {
              const djson = this.$yamlload(d.content);
              if (djson && djson.kind) {
                files.push({
                  name: d.name,
                  kind: djson.kind,
                  manifest: d.content,
                  completed: this.ThisAppEnvironmentID ? this.m_resource_checkManifestCompleteness(djson) : true,
                });
              } else {
                files.push({
                  name: d.name,
                  kind: 'Error',
                  manifest: d.content,
                  completed: false,
                });
              }
            }
          });
          if (files.length > 0) {
            this.activeFile = files[0].name;
            this.active = [this.activeFile];
          }
          this.items.push({
            name: this.app.name,
            children: files,
          });
        }
        if (this.$refs.manifestTree) this.$refs.manifestTree.updateAll(true);
        this.historyView = false;
      },
      showManifest(files) {
        if (files.length > 0) {
          this.activeFile = files[0];
        } else {
          this.active = [this.activeFile];
        }
        this.historyView = false;
      },
      addResourceFile() {
        this.$refs.addResourceFile.init(this.app);
        this.$refs.addResourceFile.open();
      },
      updateResourceFile(item) {
        this.$refs.updateResourceFile.init(this.app, item);
        this.$refs.updateResourceFile.open();
      },
      removeResourceFile(item) {
        this.$store.commit('SET_CONFIRM', {
          title: '删除资源文件',
          content: {
            text: `删除资源文件 ${item.name}`,
            type: 'delete',
            name: item.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteAppResourceFile(
              this.app.TenantID,
              this.app.ProjectID,
              this.ThisAppEnvironmentID,
              this.app.name,
              param.item.name,
            );
            this.appResourceFiles();
          },
        });
      },
      viewHistoryVersion() {
        this.historyView = true;
      },
      refresh() {
        this.appResourceFiles();
      },
      syncAppResource() {
        this.$store.commit('SET_CONFIRM', {
          title: '同步应用',
          content: {
            text: `同步应用 ${this.app.name}，该操作会导致服务重启`,
            type: 'confirm',
          },
          param: {},
          doFunc: async () => {
            await postSyncAppResource(this.app.TenantID, this.app.ProjectID, this.ThisAppEnvironmentID, this.app.name);
            this.appResourceFiles();
          },
        });
      },
      async refreshResource() {
        this.$store.commit('SET_CONFIRM', {
          title: '刷新应用资源',
          content: {
            text: `刷新应用 ${this.app.name} 的资源文件`,
            type: 'confirm',
          },
          param: {},
          doFunc: async () => {
            await postRefreshAppResource(
              this.app.TenantID,
              this.app.ProjectID,
              this.ThisAppEnvironmentID,
              this.app.name,
            );
            this.appResourceFiles();
          },
        });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .chip {
    width: 50px;
    font-size: 14px;
    line-height: 16px;
    height: 16px;
    text-align: center;
  }

  .col-position {
    position: relative;
  }

  .sync-btn {
    position: absolute;
    bottom: 12px;
    left: 0;
    right: 0;
  }
</style>
