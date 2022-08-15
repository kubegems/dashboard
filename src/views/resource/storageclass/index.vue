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
      <v-col v-for="(item, index) in items" :key="index" class="pt-0" cols="3">
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
                <v-list-item-subtitle> {{ $t('tip.provisioner') }} : {{ item.provisioner }} </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-card-actions>
              <v-spacer />
              <v-btn color="primary" small text @click="updateStorageClass(item)">
                {{ $root.$t('operate.edit') }}
              </v-btn>
              <v-btn color="error" small text @click="removeStorageClass(item)">
                {{ $root.$t('operate.delete') }}
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
              {{ $t('tip.default') }}
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
                  {{ $root.$t('operate.create_c', [$root.$t('resource.storageclass')]) }}
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <AddStorageClass ref="addStorageClass" @refresh="storageClassList" />
    <UpdateStorageClass ref="updateStorageClass" @refresh="storageClassList" />
  </v-container>
</template>

<script>
  import { mapState } from 'vuex';

  import AddStorageClass from './components/AddStorageClass';
  import UpdateStorageClass from './components/UpdateStorageClass';
  import messages from './i18n';
  import { deleteStorageClass, getStorageClassList } from '@/api';
  import BaseFilter from '@/mixins/base_filter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'StorageClass',
    i18n: {
      messages: messages,
    },
    components: {
      AddStorageClass,
      UpdateStorageClass,
    },
    mixins: [BaseFilter, BasePermission, BaseResource],
    data: () => ({
      items: [],
    }),
    computed: {
      ...mapState(['JWT']),
    },
    mounted() {
      if (this.JWT) {
        this.$nextTick(() => {
          if (this.ThisCluster === '') {
            this.$store.commit('SET_SNACKBAR', {
              text: this.$root.$t('tip.select_cluster'),
              color: 'warning',
            });
            return;
          }
          this.storageClassList();
        });
      }
    },
    methods: {
      async storageClassList() {
        const data = await getStorageClassList(this.ThisCluster, {
          size: 1000,
        });
        this.items = data.List;
      },
      addStorageClass() {
        this.$refs.addStorageClass.open();
      },
      updateStorageClass(item) {
        this.$refs.updateStorageClass.init(item);
        this.$refs.updateStorageClass.open();
      },
      removeStorageClass(item) {
        this.$store.commit('SET_CONFIRM', {
          title: this.$root.$t('operate.delete_c', [this.$root.$t('resource.storageclass')]),
          content: {
            text: `${this.$root.$t('operate.delete_c', [this.$root.$t('resource.storageclass')])} ${
              item.metadata.name
            }`,
            type: 'delete',
            name: item.metadata.name,
          },
          param: { item },
          doFunc: async (param) => {
            await deleteStorageClass(this.ThisCluster, param.item.metadata.name);
            this.storageClassList();
          },
        });
      },
      getIconName(provisioner) {
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
      },
    },
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
