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
  <v-card class="metrics-item" flat>
    <div class="metrics-item__title">
      <span class="text-body-1 kubegems__text">{{ title }}</span>
      <v-btn color="primary" small @click="setAlert"> {{ $t('operate.set_alert') }} </v-btn>
    </div>

    <div :style="{ maxHeight: `${maxHeight}px` }">
      <BaseDropSelect
        v-for="label in labels"
        :key="label.text"
        v-model="label.value"
        :variable="label.text"
        :variable-values="label.items"
        @change="onLabelChange(label)"
      />
    </div>

    <div class="metrics-item__chart">
      <div ref="container" class="metrics-item__container">
        <BaseAreaChart
          chart-type="line"
          :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
          colorful
          :extend-height="280"
          :global-plugins-check="false"
          label="all"
          :label-show="false"
          :metrics="data.data"
          single-tooptip
          title=""
          type=""
          :unit="getUnit(unit)"
        />
      </div>
    </div>
  </v-card>
</template>

<script>
  import { SERVICE_MONITOR_NS } from '@kubegems/libs/constants/namespace';
  import { debounce } from '@kubegems/libs/utils/helpers';
  import { mapState } from 'vuex';

  import messages from '../../i18n';

  export default {
    name: 'MetricsItem',
    i18n: {
      messages: messages,
    },
    props: {
      data: {
        type: Object,
        default: () => ({}),
      },
      labelpairs: {
        type: Object,
        default: () => ({}),
      },
      labelObject: {
        type: Object,
        default: () => ({}),
      },
      title: {
        type: String,
        default: '',
      },
      unit: {
        type: String,
        default: '',
      },
    },
    data() {
      this._onResize = debounce(this.onResize, 200);

      return {
        size: {
          width: 0,
          height: 0,
        },
      };
    },
    computed: {
      ...mapState(['Scale']),
      labels() {
        return Object.values(this.labelObject);
      },
      keys() {
        return Object.keys(this.labelObject);
      },
      maxHeight() {
        if (this.labels.length % 4 === 0) {
          return (36 * this.labels.length) / 4;
        } else {
          return 36 * parseInt(this.labels.length / 4 + 1);
        }
      },
    },
    watch: {
      keys: {
        handler(newValue) {
          if (newValue?.length > 0) {
            this.getLabelItems();
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.onResize();
      });
      window.addEventListener('resize', this._onResize);
    },
    beforeDestroy() {
      window.removeEventListener('resize', this._onResize);
    },
    methods: {
      onResize() {
        if (this.$refs.container) {
          this.size = {
            width: this.$refs.container.offsetWidth,
            height: this.$refs.container.offsetHeight,
          };
        }
      },
      setAlert() {
        const { resourceObj, unit, cluster, environment, ql, expr } = this.data?._$origin;
        const labelpairs = {};
        for (const key in this.labelpairs) {
          if (this.labelpairs[key] && this.labelpairs[key].length) {
            labelpairs[key] = this.labelpairs[key].reduce(
              (pre, current, index, arr) => pre + current + `${index === arr.length - 1 ? '' : '|'}`,
              '',
            );
          }
        }
        let params = {};
        if (ql) {
          params = { expr: expr };
        } else {
          params = {
            promqlGenerator: {
              resource: resourceObj.name,
              rule: resourceObj.rule,
              scope: resourceObj.scope,
              unit: unit?.value,
              labelpairs: labelpairs,
            },
          };
        }
        this.$emit(
          'alert',
          Object.assign(
            {
              name: '',
              for: '1m',
              promqlGenerator: null,
              alertLevels: [],
              receivers: [],
            },
            params,
          ),
          resourceObj,
        );

        this.$router.replace({
          query: {
            cluster: environment?.clusterName || cluster?.text,
            namespace: environment?.namespace || SERVICE_MONITOR_NS,
          },
        });
      },
      getLabelItems() {
        this.labels.forEach((label) => {
          this.$emit('loadLabel', label.text);
        });
      },
      onLabelChange(label) {
        this.$emit('change', { label });
      },
      onRefresh() {
        this.$emit('refresh');
      },
      getUnit(unit) {
        if (unit === 'short') {
          return 'short';
        }
        if (unit && unit.indexOf('-') > -1) {
          return unit.substr(unit.indexOf('-') + 1);
        }
        return unit;
      },
    },
  };
</script>

<style lang="scss" scoped>
  .metrics-item {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 456px;
    padding: 12px;

    &__title {
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    &__chart {
      position: relative;
      flex: auto;
    }

    &__container {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
  }
</style>
