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
  <v-card>
    <v-data-table
      class="mx-4"
      disable-sort
      :headers="headers"
      hide-default-footer
      :items="items"
      :items-per-page="params.size"
      no-data-text="暂无数据"
      :page.sync="params.page"
    >
      <template #[`item.severity`]="{ item }">
        <v-menu
          bottom
          :close-delay="200"
          max-width="200"
          nudge-bottom="5px"
          offset-y
          open-on-hover
          origin="top left"
          right
          transition="scale-transition"
        >
          <template #activator="{ on }">
            <v-chip v-if="!item.isHarborRegistry || !item.report" class="white--text" color="blue-grey" label small>
              -
            </v-chip>
            <v-chip
              v-else-if="item.scanStatus !== ''"
              class="white--text"
              :color="severityDict[item.severity] ? severityDict[item.severity].Color : ''"
              label
              small
              v-on="on"
            >
              {{ severityDict[item.severity] ? severityDict[item.severity].CN : '' }}
            </v-chip>
            <v-chip v-else class="white--text" color="blue-grey" label small> 未扫描 </v-chip>
          </template>
          <v-card flat width="100%">
            <v-flex class="text-body-2 text-center primary white--text py-2">
              <v-icon color="white" left small> mdi-chart-bar </v-icon>
              <span>漏洞统计</span>
            </v-flex>
            <v-list class="pa-0 kubegems__tip" dense>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item class="float-left pa-0" two-line>
                    <v-list-item-content class="py-0">
                      <v-list-item-title> 严重 </v-list-item-title>
                      <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                        {{ item && item.report ? item.report.summary.Critical : 0 }}
                      </v-list-item-content>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item class="float-left pa-0" two-line>
                    <v-list-item-content class="py-0">
                      <v-list-item-title> 高 </v-list-item-title>
                      <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                        {{ item && item.report ? item.report.summary.High : 0 }}
                      </v-list-item-content>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item class="float-left pa-0" two-line>
                    <v-list-item-content class="py-0">
                      <v-list-item-title> 中等 </v-list-item-title>
                      <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                        {{ item && item.report ? item.report.summary.Medium : 0 }}
                      </v-list-item-content>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item class="float-left pa-0" two-line>
                    <v-list-item-content class="py-0">
                      <v-list-item-title> 低 </v-list-item-title>
                      <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                        {{ item && item.report ? item.report.summary.Low : 0 }}
                      </v-list-item-content>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item class="float-left pa-0" two-line>
                    <v-list-item-content class="py-0">
                      <v-list-item-title> 可修复 </v-list-item-title>
                      <v-list-item-content class="text-caption kubegems__text kubegems__break-all">
                        {{ item && item.report ? item.report.fixable : 0 }}
                      </v-list-item-content>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </template>
      <template #[`item.scanTool`]> Trivy </template>
      <template #[`item.updatedAt`]="{ item }">
        {{ item.updatedAt ? $moment(item.updatedAt).format('lll') : '' }}
      </template>
      <template #[`item.published`]="{ item }">
        {{ item.unpublishable ? '不可发布' : '允许发布' }}
      </template>
      <template #[`item.action`]="{ item }">
        <v-flex :id="`r${item.ID}`" />
        <v-menu :attach="`#r${item.ID}`" left>
          <template #activator="{ on }">
            <v-btn icon>
              <v-icon color="primary" small v-on="on"> mdi-dots-vertical </v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-text class="pa-2 text-center">
              <v-flex>
                <v-btn
                  v-if="item.scanStatus !== '' && item.isHarborRegistry"
                  color="primary"
                  small
                  text
                  @click="reportDetail(item)"
                >
                  报告
                </v-btn>
              </v-flex>
              <v-flex v-if="m_permisson_resourceAllow">
                <v-btn
                  v-if="!item.unpublishable && item.isHarborRegistry"
                  color="primary"
                  small
                  text
                  @click="labelNoPublish(item)"
                >
                  标记不可发布
                </v-btn>
                <v-btn
                  v-if="item.unpublishable && item.isHarborRegistry"
                  color="primary"
                  small
                  text
                  @click="labelPublish(item)"
                >
                  允许发布
                </v-btn>
              </v-flex>
              <v-flex v-if="!item.isHarborRegistry" class="pa-2"> 不可操作 </v-flex>
            </v-card-text>
          </v-card>
        </v-menu>
      </template>
    </v-data-table>
    <BasePagination
      v-if="pageCount >= 1"
      v-model="params.page"
      :page-count="pageCount"
      :size="params.size"
      @changepage="onPageIndexChange"
      @changesize="onPageSizeChange"
      @loaddata="appImageSecurityReportList"
    />

    <AppImageSecurityReportDetail ref="appImageSecurityReportDetail" />
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex';

  import AppImageSecurityReportDetail from './AppImageSecurityReportDetail';
  import { getAppImageSecurityReportList, putSetPublishAppImage } from '@/api';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'AppImageSecurityReportList',
    components: {
      AppImageSecurityReportDetail,
    },
    mixins: [BasePermission, BaseResource],
    props: {
      app: {
        type: Object,
        default: () => null,
      },
    },
    data: () => ({
      items: [],
      headers: [
        { text: '镜像版本', value: 'image', align: 'start' },
        { text: '更新时间', value: 'updatedAt', align: 'start' },
        { text: '风险等级', value: 'severity', align: 'start' },
        { text: '扫描工具', value: 'scanTool', align: 'start' },
        { text: '可发布', value: 'published', align: 'start' },
        { text: '操作', value: 'action', align: 'center', width: 20 },
      ],
      pageCount: 0,
      params: {
        page: 1,
        size: 10,
        noprocessing: true,
      },
      severityDict: {
        Critical: {
          CN: '严重',
          Color: 'red',
        },
        High: {
          CN: '高',
          Color: 'deep-purple',
        },
        Medium: {
          CN: '中等',
          Color: 'warning',
        },
        Low: {
          CN: '低',
          Color: 'blue',
        },
        Unknown: {
          CN: '无漏洞',
          Color: 'success',
        },
      },
    }),
    computed: {
      ...mapGetters(['Tenant', 'Project']),
    },
    watch: {
      app() {
        this.appImageSecurityReportList();
      },
    },
    mounted() {
      if (this.app) {
        this.appImageSecurityReportList();
      }
    },
    methods: {
      async appImageSecurityReportList() {
        if (this.app.images.length === 0) {
          return;
        }
        const image = this.app.images[0];
        if (!image) {
          return;
        }
        const data = await getAppImageSecurityReportList(
          this.app.TenantID,
          this.app.ProjectID,
          Object.assign(this.params, {
            image: image,
          }),
        );
        this.items = data.List.map((d, index) => {
          return { ID: index, ...d };
        });
        this.pageCount = Math.ceil(data.Total / this.params.size);
        this.params.page = data.CurrentPage;
      },
      reportDetail(item) {
        this.$refs.appImageSecurityReportDetail.init(this.app, item);
        this.$refs.appImageSecurityReportDetail.open();
      },
      labelNoPublish(item) {
        this.$store.commit('SET_CONFIRM', {
          title: '不可发布',
          content: { text: `标记 ${item.image} 不可发布`, type: 'confirm' },
          param: { item },
          doFunc: async (param) => {
            await putSetPublishAppImage(this.app.TenantID, this.app.ProjectID, {
              image: param.item.image,
              unpublishable: true,
            });
            this.appImageSecurityReportList();
          },
        });
      },
      labelPublish(item) {
        this.$store.commit('SET_CONFIRM', {
          title: '允许发布',
          content: { text: `标记 ${item.image} 允许发布`, type: 'confirm' },
          param: { item },
          doFunc: async (param) => {
            await putSetPublishAppImage(this.app.TenantID, this.app.ProjectID, {
              image: param.item.image,
              unpublishable: true,
            });
            this.appImageSecurityReportList();
          },
        });
      },
      onPageSizeChange(size) {
        this.params.page = 1;
        this.params.size = size;
      },
      onPageIndexChange(page) {
        this.params.page = page;
      },
    },
  };
</script>
