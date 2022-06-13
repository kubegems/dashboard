<template>
  <BasePanel v-model="panel" icon="fas fa-exclamation" title="漏洞报告" :width="`50%`" @dispose="dispose">
    <template #header>
      <span class="ml-2 text-subtitle-1">
        {{ item ? item.ImageName : '' }}
      </span>
    </template>
    <template #content>
      <v-card>
        <v-card-text class="my-0 py-0 px-2">
          <v-data-table
            class="kubegems__table-row-pointer"
            disable-sort
            :headers="headers"
            :height="height"
            hide-default-footer
            item-key="index"
            :items="items"
            :items-per-page="1000"
            no-data-text="暂无数据"
            show-expand
            single-expand
            @click:row="onRowClick"
          >
            <template #[`item.id`]="{ item }">
              {{ item.id }}
            </template>
            <template #[`item.severity`]="{ item }">
              <v-chip
                v-if="item.ScanStatus !== ''"
                class="white--text"
                :color="severityDict[item.severity] ? severityDict[item.severity].Color : ''"
                label
                small
              >
                {{ severityDict[item.severity] ? severityDict[item.severity].CN : '' }}
              </v-chip>
            </template>
            <template #[`item.package`]="{ item }">
              {{ item.package }}
            </template>
            <template #[`item.version`]="{ item }">
              {{ item.version }}
            </template>
            <template #[`item.fixVersion`]="{ item }">
              {{ item.fix_version }}
            </template>
            <template #expanded-item="{ headers, item }">
              <td class="ma-2" :colspan="headers.length">
                <v-flex>
                  描述:
                  <pre class="kubegems__word-all-break">{{ item.description }}</pre>
                </v-flex>
                <v-flex>
                  链接：
                  <v-flex v-for="(link, index) in item.links" :key="index">
                    <a :href="link" target="blank">{{ link }}</a>
                  </v-flex>
                </v-flex>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </template>
  </BasePanel>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import { getAppImageSecurityReportDetail } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'AppImageSecurityReportDetail',
    data: () => ({
      panel: false,
      item: null,
      items: [],
      app: null,
      headers: [
        { text: '编号', value: 'id', align: 'start' },
        { text: '严重度', value: 'severity', align: 'start' },
        { text: '组件', value: 'package', align: 'start' },
        { text: '当前版本', value: 'version', align: 'start' },
        { text: '修复版本', value: 'fixVersion', align: 'start' },
        { text: '', value: 'data-table-expand' },
      ],
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
      ...mapState(['Scale']),
      ...mapGetters(['Tenant', 'Project']),
      height() {
        return parseInt((window.innerHeight - 64) / this.Scale);
      },
    },
    methods: {
      // eslint-disable-next-line vue/no-unused-properties
      open() {
        this.panel = true;
      },
      // eslint-disable-next-line vue/no-unused-properties
      init(app, item) {
        this.item = deepCopy(item);
        this.app = deepCopy(app);
        this.appImageSecurityReportDetail();
      },
      async appImageSecurityReportDetail() {
        const data = await getAppImageSecurityReportDetail(this.app.TenantID, this.app.ProjectID, {
          image: this.item.image,
        });
        if (data.vulnerabilities) {
          this.items = data.vulnerabilities.map((item, index) => {
            return {
              index: index,
              ...item,
            };
          });
        }
      },
      dispose() {
        this.items = [];
      },
      onRowClick(item, { expand, isExpanded }) {
        expand(!isExpanded);
      },
    },
  };
</script>
