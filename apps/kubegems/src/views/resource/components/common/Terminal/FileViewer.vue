<!--
 * Copyright 2022 The kubegems.io Authors
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *       http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License. 
-->
<template>
  <BaseDialog
    v-model="state.dialog"
    icon="mdi-file"
    :min-height="800"
    :title="`${i18nLocal.t('tip.file_viewer')}  ${query.t_pod}/${query.t_container}`"
    :width="1400"
    @reset="reset"
  >
    <template #content>
      <v-row class="file__row">
        <v-col :cols="3">
          <div class="ml-3 pt-2 pb-2">{{ i18nLocal.t('tip.file_tree') }}</div>
          <v-treeview
            activatable
            :active.sync="fileTree.active"
            class="file__tree"
            color="primary"
            dense
            expand-icon="mdi-chevron-down"
            item-key="absnameKey"
            :items="fileItems"
            :load-children="getFilesInDir"
            :open.sync="fileTree.open"
            open-all
            open-on-click
            return-object
            rounded
            :search="fileTree.search"
            transition
            @update:active="activeNode"
          >
            <template #prepend="{ item }">
              <v-icon v-if="item.isDir || item.children" color="primary" left small> mdi-folder </v-icon>
              <v-icon v-else color="primary" left small> {{ getIconByFileExt(item.name) }} </v-icon>
            </template>
            <template #label="{ item }">
              <div v-if="item.isDir || item.children" class="text-body-2" @click.stop="openNode(item)">
                {{ item.name }}
              </div>
              <div v-else class="text-body-2">{{ item.name }}</div>
            </template>
          </v-treeview>
        </v-col>
        <v-col :cols="9" :style="{ position: 'relative' }">
          <v-card-title class="pa-0">
            <BaseFilter1
              :default="{ items: [], text: i18nLocal.t('filter.filename'), value: 'search' }"
              :filters="filters"
              :reload="false"
              @filter="customFilter"
            />
            <v-spacer />
            <FileUploader ref="uploader" :directory="currentDir" @refresh="refresh" />
          </v-card-title>
          <div class="mt-2">{{ i18nLocal.t('tip.path') }}: {{ currentDir }}</div>
          <v-data-table
            class="file__table"
            disable-sort
            :headers="headers"
            hide-default-footer
            item-key="absnameKey"
            :items="items"
            :items-per-page="pagination.size"
            :no-data-text="i18n.t('data.no_data')"
            :page.sync="pagination.page"
            @page-count="pagination.pageCount = $event"
          >
            <template #item.name="{ item }">
              <v-icon v-if="item.islink" color="primary" left small> mdi-link-variant </v-icon>
              <v-icon v-else-if="item.isDir || item.children" color="primary" left small> mdi-folder </v-icon>
              <v-icon v-else color="primary" left small> {{ getIconByFileExt(item.name) }} </v-icon>
              <span v-if="item.isDir || item.children" class="kubegems__pointer" @click="enterDir(item)">
                {{ item.name }}
              </span>
              <span v-else> {{ item.name }} </span>
              <abbr v-if="item.islink" class="success--text">
                <v-icon v-if="item.islink" class="ml-2" color="grey" left small> mdi-arrow-right </v-icon>
                {{ item.realFile }}
              </abbr>
            </template>
            <template #item.modtime="{ item }">
              {{ moment(item.modtime).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
            <template #item.size="{ item }">
              {{ beautifyFileUnit(item.size, 2) }}
            </template>
            <template #item.action="{ item }">
              <FileDownloader :file-name="item.absname" />
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </template>
  </BaseDialog>
</template>

<script lang="ts" setup>
  import { File } from '@kubegems/api/typed/file';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useQuery } from '@kubegems/extension/router';
  import { beautifyFileUnit, deepCopy } from '@kubegems/libs/utils/helpers';
  import moment from 'moment';
  import { reactive, ref } from 'vue';

  import { useI18n } from '../../i18n';
  import FileDownloader from './FileDownloader.vue';
  import FileUploader from './FileUploader.vue';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const query = useQuery();

  const state = reactive({
    dialog: false,
  });

  const fileItems = ref<File[]>([
    new File({
      name: '/',
      isDir: true,
      absname: '/',
      absnameKey: '-',
      children: [],
    }),
  ]);
  let fileTree = reactive({
    active: undefined,
    items: [],
    search: '',
    open: [],
  });

  const headers = [
    { text: i18nLocal.t('table.filename'), value: 'name', align: 'start' },
    { text: i18nLocal.t('table.prop'), value: 'mode', align: 'start' },
    { text: i18nLocal.t('table.owner'), value: 'owner', align: 'start' },
    { text: i18nLocal.t('table.group'), value: 'group', align: 'start' },
    { text: i18nLocal.t('table.size'), value: 'size', align: 'start' },
    { text: i18nLocal.t('table.update_at'), value: 'modtime', align: 'start' },
    { text: '', value: 'action', align: 'center', width: 20 },
  ];

  const items = ref([]);
  const itemsCopy = ref([]);
  let pagination: Pagination<File> = reactive<Pagination<File>>({
    page: 1,
    size: 1000,
    items: [],
    pageCount: 0,
    search: '',
  });
  const currentDir = ref('/');

  const filters = [{ text: i18nLocal.t('filter.filename'), value: 'search', items: [] }];

  const customFilter = (): void => {
    if (query.value.search) {
      items.value = itemsCopy.value.filter((item) => {
        return item.name && item.name.toLocaleLowerCase().indexOf(query.value.search.toLocaleLowerCase()) > -1;
      });
    } else {
      items.value = itemsCopy.value;
    }
  };

  const insertFilesF = (key: string, rootFiles: File[], insertFiles: File[]): void => {
    rootFiles.forEach((file) => {
      if (file.children)
        if (file.absname === key) {
          file.children = insertFiles;
        } else {
          insertFilesF(key, file.children, insertFiles);
        }
    });
  };

  const getFilesInDir = async (file: File, autoOpen = false): Promise<void> => {
    const data = await new File().getFileListInDir(query.value.t_cluster, query.value.t_namespace, query.value.t_pod, {
      container: query.value.t_container,
      directory: file?.absname || '/',
    });
    const treeData = data.map((d) => {
      const nd = {
        ...d,
        absnameKey: `${d.baseDir}-${d.name}`.replaceAll('/', '_').replaceAll('.', '_'),
        absname: `${d.baseDir}/${d.name}`.replaceAll('//', '/'),
      };
      if (d.isDir) {
        nd['children'] = [];
      }
      return nd;
    });
    if (file.absname === '/') {
      fileItems.value[0].children = treeData;
    } else {
      insertFilesF(file.absname || '/', fileItems.value, treeData as any);
    }
    items.value = treeData;
    itemsCopy.value = deepCopy(treeData);
    currentDir.value = file?.absname || '/';

    if (
      !fileTree.open.some((f) => {
        return f.absnameKey === file.absnameKey;
      }) &&
      autoOpen
    ) {
      fileTree.open.push(file);
    }
  };

  const openNode = (file: File): void => {
    if (file && file.isDir) {
      if (file?.children?.length > 0) {
        items.value = file.children;
        itemsCopy.value = deepCopy(file.children);
      }
      currentDir.value = file?.absname;
    }
  };

  const activeNode = (): void => {
    if (fileTree.active?.length > 0) {
      const node = fileTree.active[0];
      currentDir.value = node?.baseDir;
    }
  };

  const enterDir = (item: File): void => {
    getFilesInDir(new File(item), true);
  };

  const getIconByFileExt = (file: string): string => {
    const ext = file.split('.').pop().toLowerCase();
    switch (ext) {
      case 'html':
      case 'htm':
        return 'mdi-language-html5';
      case 'js':
        return 'mdi-language-javascript';
      case 'ts':
        return 'mdi-language-typescript';
      case 'md':
        return 'mdi-language-markdown';
      case 'png':
      case 'svg':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return 'mdi-file-image';
      case 'xls':
        return 'mdi-file-excel';
      case 'go':
        return 'mdi-language-go';
      case 'json':
        return 'mdi-code-json';
      case 'java':
        return 'mdi-language-java';
      case 'python':
        return 'mdi-language-python';
      case 'php':
        return 'mdi-language-php';
      case 'log':
        return 'mdi-text-box-outline';
      case 'ico':
        return 'mdi-star';
      default:
        return 'mdi-file-document-outline';
    }
  };

  const uploader = ref(null);
  const reset = (): void => {
    state.dialog = false;
    fileItems.value = [
      new File({
        name: '/',
        isDir: true,
        absname: '/',
        absnameKey: '-',
        children: [],
      }),
    ];
    fileTree = Object.assign(fileTree, {
      active: undefined,
      items: [],
      search: '',
      open: [],
    });
    items.value = [];
    itemsCopy.value = [];
    currentDir.value = '/';

    if (uploader.value) uploader.value.reset();
  };

  const open = async (): Promise<void> => {
    state.dialog = true;
    getFilesInDir(
      new File({
        absname: '/',
      }),
    );
  };

  defineExpose({
    open,
  });

  const refresh = (directory: string): void => {
    getFilesInDir(
      new File({
        absname: directory,
      }),
    );
  };
</script>

<style lang="scss" scoped>
  .file {
    &__row {
      max-height: 700px;
    }

    &__tree {
      max-height: 630px;
      overflow: auto;
    }

    &__table {
      max-height: 600px;
      overflow: auto;
    }
  }
</style>
