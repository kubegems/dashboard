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
  <v-container fluid>
    <BaseViewportHeader />
    <BaseBreadcrumb />
    <v-row class="mt-0">
      <v-col v-for="(item, index) in storageClassItems" :key="index" class="pt-0" cols="3">
        <v-hover #default="{ hover }">
          <v-card class="mx-auto sc-pos" :elevation="hover ? 5 : 0" flat height="100%">
            <v-list-item three-line>
              <v-list-item-avatar class="primary--text" size="80" tile>
                <Icon
                  v-if="getIconName(item.provisioner) && getIconName(item.provisioner).indexOf('img:') === -1"
                  class="ml-2"
                  :icon="getIconName(item.provisioner)"
                  :style="{ width: `60px`, height: `60px` }"
                />
                <img v-else class="img" :src="`/icon/${getIconName(item.provisioner).replaceAll('img:', '')}`" />
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="text-h6 mb-1">
                  <a>{{ item.metadata.name }}</a>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ i18nLocal.t('tip.provisioner') }} : {{ item.provisioner }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" small text @click="updateStorageClass(item)">
                {{ i18n.t('operate.edit') }}
              </v-btn>
              <v-btn color="error" small text @click="removeStorageClass(item)">
                {{ i18n.t('operate.delete') }}
              </v-btn>
            </v-card-actions>
            <v-flex
              v-if="
                item.metadata.annotations &&
                item.metadata.annotations['storageclass.kubernetes.io/is-default-class'] &&
                item.metadata.annotations['storageclass.kubernetes.io/is-default-class'] === 'true'
              "
              class="sc-watermark-bg"
            />
            <v-flex
              v-if="
                item.metadata.annotations &&
                item.metadata.annotations['storageclass.kubernetes.io/is-default-class'] &&
                item.metadata.annotations['storageclass.kubernetes.io/is-default-class'] === 'true'
              "
              class="sc-watermark font-weight-medium"
            >
              {{ i18nLocal.t('tip.default') }}
            </v-flex>
          </v-card>
        </v-hover>
      </v-col>
      <v-col class="pt-0" cols="3">
        <v-card class="kubegems__full-height" flat min-height="156">
          <v-card-text class="pa-0 kubegems__full-height">
            <v-list-item class="kubegems__full-height" three-line>
              <v-list-item-content>
                <v-btn block class="text-h6" color="primary" text @click="addStorageClass">
                  <v-icon left>mdi-plus-box</v-icon>
                  {{ i18n.t('operate.create_c', [i18n.t('resource.storageclass')]) }}
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <StorageClassForm ref="storageClass" @refresh="getStorageClassList" />
  </v-container>
</template>

<script lang="ts" setup>
  import { StorageClass } from '@kubegems/api/typed/storageclass';
  import { convertResponse2List } from '@kubegems/api/utils';
  import { useGlobalI18n } from '@kubegems/extension/i18n';
  import { useCluster } from '@kubegems/extension/resource';
  import { useStore } from '@kubegems/extension/store';
  import { onMounted, ref } from 'vue';

  import StorageClassForm from './components/StorageClassForm.vue';
  import { useI18n } from './i18n';

  const i18n = useGlobalI18n();
  const i18nLocal = useI18n();
  const store = useStore();

  const storageClass = ref(null);
  const addStorageClass = (): void => {
    storageClass.value.open();
  };

  const updateStorageClass = (item): void => {
    storageClass.value.init(item);
    storageClass.value.open();
  };

  const storageClassItems = ref<StorageClass[]>([]);
  const getStorageClassList = async (): Promise<void> => {
    const data = await new StorageClass().getStorageClassList(useCluster(), { page: 1, size: 1000 });
    storageClassItems.value = convertResponse2List(data);
  };

  onMounted(() => {
    getStorageClassList();
  });

  const removeStorageClass = async (item: StorageClass): Promise<void> => {
    store.commit('SET_CONFIRM', {
      title: i18n.t('operate.delete_c', [i18n.t('resource.storageclass')]),
      content: {
        text: `${i18n.t('operate.delete_c', [i18n.t('resource.storageclass')])} ${item.metadata.name}`,
        type: 'delete',
        name: item.metadata.name,
      },
      param: { item },
      doFunc: async (param) => {
        await new StorageClass(param.item).deleteStorageClass(useCluster());
        getStorageClassList();
      },
    });
  };

  const getIconName = (provisioner: string): string => {
    if (provisioner) {
      if (provisioner.indexOf('ceph') > -1) return 'img:ceph.svg';
      if (provisioner.indexOf('openebs') > -1) return 'img:openebs.svg';
      if (provisioner.indexOf('rancher') > -1) return 'logos:rancher-icon';
      if (provisioner.indexOf('gluster') > -1) return 'img:glusterfs.svg';
      if (provisioner.indexOf('azure') > -1) return 'logos:azure-icon';
      if (provisioner.indexOf('aws') > -1) return 'logos:aws';
      if (provisioner.indexOf('cinder') > -1) return 'logos:openstack-icon';
      if (provisioner.indexOf('gce') > -1) return 'logos:google-cloud';
      if (provisioner.indexOf('longhorn') > -1) return 'img:longhorn.svg';
      if (provisioner.indexOf('carina') > -1) return 'img:carina.svg';
    }
    return 'img:storage.svg';
  };
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
