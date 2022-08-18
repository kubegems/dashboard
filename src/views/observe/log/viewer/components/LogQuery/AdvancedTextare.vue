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
  <div class="mx-2">
    <v-textarea
      ref="advanceTextarea"
      v-model="ql"
      auto-grow
      clearable
      dense
      hide-details
      rows="5"
      @blur.stop="blurInput"
      @click:clear="clearInput"
      @focus.stop="focusInput"
      @keyup="onSuggestionInput"
    >
      <template #append>
        <v-btn color="primary" small text @click.stop="addAlertRule"> {{ $t('operate.generate_alert') }} </v-btn>
      </template>
    </v-textarea>
    <v-data-table
      v-if="suggestShow"
      class="suggestion-table kubegems__table-row-pointer"
      :custom-filter="filterKeyword"
      dense
      disable-pagination
      disable-sort
      :headers="headers"
      hide-default-footer
      hide-default-header
      item-key="item.value"
      :items="filterItems"
      :loading="loading"
      :loading-text="$t('tip.loading')"
      :no-data-text="$root.$t('data.no_data')"
      :no-results-text="$root.$t('data.no_data')"
      :search="keyword"
      :style="`top: ${suggestTop}px;`"
      @click:row="selectComplete"
    >
      <template #[`item.item`]="{ item }">
        {{ item.value }}
      </template>
    </v-data-table>

    <AddAlertRule ref="addAlertRule" :expr="ql" mode="logging" />
  </div>
</template>

<script>
  import messages from '../../../i18n';
  import { getLogLabels } from '@/api';
  import AddAlertRule from '@/views/observe/monitor/config/prometheusrule/components/AddPrometheusRule';

  export default {
    name: 'AdvancedTextarea',
    i18n: {
      messages: messages,
    },
    components: {
      AddAlertRule,
    },
    props: {
      cluster: {
        type: Object,
        default: () => ({}),
      },
      logQL: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      suggestShow: false,
      filterItems: [],
      originRangeFunctions: [
        { text: 'rate', value: 'rate', t: 'normal' },
        { text: 'count_over_time', value: 'count_over_time', t: 'time' },
        { text: 'sum_over_time', value: 'sum_over_time', t: 'time' },
        { text: 'avg_over_time', value: 'avg_over_time', t: 'time' },
        { text: 'max_over_time', value: 'max_over_time', t: 'time' },
        { text: 'min_over_time', value: 'min_over_time', t: 'time' },
        { text: 'topk', value: 'topk', t: 'top' },
        { text: 'sum', value: 'sum', t: 'normal' },
        { text: 'min', value: 'min', t: 'normal' },
        { text: 'max', value: 'max', t: 'normal' },
        { text: 'avg', value: 'avg', t: 'normal' },
        { text: 'stddev', value: 'stddev', t: 'normal' },
        { text: 'stdvar', value: 'stdvar', t: 'normal' },
        { text: 'count', value: 'count', t: 'normal' },
        { text: 'bottomk', value: 'bottomk', t: 'top' },
        { text: 'stdvar_over_time', value: 'stdvar_over_time', t: 'time' },
        { text: 'stddev_over_time', value: 'stddev_over_time', t: 'time' },
        { text: 'quantile_over_time', value: 'quantile_over_time', t: 'time' },
      ],
      originLabels: [],
      originValues: [],
      originPiplines: [
        { text: 'json', value: 'json', t: 'none' },
        { text: 'line_format', value: 'line_format', t: 'quote' },
        { text: 'logfmt', value: 'logfmt', t: 'none' },
        { text: 'regexp', value: 'regexp', t: 'quote' },
        { text: 'label_format', value: 'label_format', t: 'space' },
        { text: 'unwrap', value: 'unwrap', t: 'space' },
      ],
      loading: false,
      tmpFilters: [],
      keyword: '',
      position: 0,
      suggestTop: 190,
      ql: '',
      headers: [{ text: '', value: 'item', align: 'start' }],
    }),
    watch: {
      logQL: {
        handler: function () {
          this.ql = this.logQL;
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.ql = this.logQL;
      });
    },
    methods: {
      async logLabels() {
        this.loading = true;
        const res = await getLogLabels(this.cluster.text, { noprocessing: true });
        this.originLabels = [];
        const keyArr = ['app', 'pod', 'container', 'node', 'stream', 'image'];
        res.forEach((item) => {
          if (keyArr.indexOf(item) > -1) {
            this.originLabels.push({
              text: item,
              value: item,
              t: 'label',
            });
          }
        });

        this.loading = false;
      },
      clearInput() {
        this.ql = '';
        this.keyword = '';
        this.suggestShow = false;
        // this.suggestTop = 62
        this.$refs.advanceTextarea.blur();
        this.filterItems = this.originRangeFunctions;
        this.tmpFilters = this.originRangeFunctions;
      },
      focusInput() {
        const vue = this;
        setTimeout(() => {
          vue.suggestShow = true;
        }, 350);
        if (this.ql === '') {
          this.keyword = '';
          this.filterItems = this.originRangeFunctions;
          this.tmpFilters = this.originRangeFunctions;
        }
        this.$emit('setQl', this.ql);
      },
      blurInput(e) {
        this.position = e.srcElement.selectionStart;
        const vue = this;
        setTimeout(() => {
          vue.suggestShow = false;
        }, 300);
        this.$emit('setQl', this.ql);
      },
      selectComplete(item) {
        if (!this.ql) return;
        this.ql = `${this.ql.substr(0, this.position - this.keyword.length)}${this.ql.substr(this.position)}`;
        this.position = this.position - this.keyword.length;
        switch (item.t) {
          case 'normal':
            this.ql = `${item.value}(${this.ql})`;
            break;
          case 'top':
            this.ql = `${item.value}(10, ${this.ql})`;
            break;
          case 'time':
            this.ql = `${item.value}(${this.ql}[5m])`;
            break;
          case 'none':
            this.ql = `${this.ql.substr(0, this.position)}${item.value}${this.ql.substr(this.position)}`;
            break;
          case 'space':
            this.ql = `${this.ql.substr(0, this.position)}${item.value} ${this.ql.substr(this.position)}`;
            break;
          case 'quote':
            this.ql = `${this.ql.substr(0, this.position)}${item.value} \`${this.ql.substr(this.position)}`;
            break;
          case 'label':
            this.ql = `${this.ql.substr(0, this.position)}${item.value}=${this.ql.substr(this.position)}`;
            this.label = item.value;
            break;
          case 'val':
            this.ql = `${this.ql.substr(0, this.position)}${item.value}"${this.ql.substr(this.position)}`;
            break;
        }
        this.keyword = '';
        this.suggestShow = false;
        this.filterItems = [];
        this.$refs.advanceTextarea.focus();
      },
      async onSuggestionInput(e) {
        if (!this.cluster.value) {
          this.$store.commit('SET_SNACKBAR', {
            text: this.$root.$t('tip.select_project_environment'),
            color: 'warning',
          });
          return;
        }
        // this.suggestTop = this.$refs.advanceTextarea.$el.clientHeight + 4
        if (this.suggestTop <= this.$refs.advanceTextarea.$el.clientHeight + 90) {
          this.suggestTop = e.key === 'Enter' ? this.suggestTop + 25 : this.suggestTop;
        } else {
          this.suggestTop = this.$refs.advanceTextarea.$el.clientHeight + 4;
        }
        const p = e.srcElement.selectionStart;
        if (e.keyCode > 32 && e.keyCode <= 200) {
          this.keyword += e.key;
        }
        if (this.ql === '') {
          this.keyword = '';
          this.filterItems = [];
          this.filterItems = this.originRangeFunctions;
          this.tmpFilters = this.originRangeFunctions;
        } else {
          let key = e.key;
          if (e.key === 'Backspace') {
            key = this.ql[p - 1];
            this.keyword = this.keyword.substr(0, this.keyword.length - 1);
          }
          switch (key) {
            case '{':
            case ',':
              if (
                (this.ql.indexOf('{') < p && this.ql.indexOf('}') >= p && this.ql[p - 1] !== '{') ||
                this.ql === '{' ||
                (this.ql.indexOf('{') < p && this.ql.indexOf('}') === -1)
              ) {
                // label show
                this.keyword = '';
                await this.logLabels();
                this.filterItems = this.originLabels;
                this.tmpFilters = this.originLabels;
              }
              break;
            case '"':
              if (!this.ql.substr(this.ql.indexOf('{'), this.ql.indexOf('}')).match(new RegExp('"', 'g'))) {
                return;
              }
              if (
                this.ql.indexOf('}') === -1 ||
                (this.ql.indexOf('{') < p && this.ql.indexOf('}') > p) ||
                this.ql.substr(this.ql.indexOf('{'), this.ql.indexOf('}')).match(new RegExp('"', 'g')).length % 2 === 1
              ) {
                // label value
                this.keyword = '';
                this.filterItems = this.originValues;
                this.tmpFilters = this.originValues;
              }
              break;
            case '|':
              // pipelinex
              this.keyword = '';
              this.filterItems = this.originPiplines;
              this.tmpFilters = this.originPiplines;
              break;
            default:
              if (this.ql.indexOf('{') > -1 && this.ql.indexOf('{') === p - 1 && this.ql.length > p) {
                this.keyword = '';
                await this.logLabels();
                this.filterItems = this.originLabels;
                this.tmpFilters = this.originLabels;
              } else if ((this.ql.indexOf('}') > -1 && this.ql.indexOf('}') === p - 1) || p === 0) {
                this.keyword = '';
                this.filterItems = this.originRangeFunctions;
                this.tmpFilters = this.originRangeFunctions;
              }
          }
          this.filterItems = this.tmpFilters.filter((item) => {
            return item.value.indexOf(this.keyword) > -1;
          });
          this.$emit('setQl', this.ql);
        }
      },
      filterKeyword(value, search, item) {
        return typeof item.value === 'string' && item.value.toString().indexOf(search) !== -1;
      },
      addAlertRule() {
        this.$emit('replaceUrl');
        this.$refs.addAlertRule.open();
      },
    },
  };
</script>

<style lang="scss" scoped>
  .suggestion-table {
    min-width: 200px !important;
    box-shadow: 1px 2px 2px gray !important;
    position: absolute;
    z-index: 1;
    left: 20px;
    max-height: 300px;
    overflow-y: auto;
    font-weight: normal;
    border-radius: 8px;
  }
</style>
