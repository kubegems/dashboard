<template>
  <v-card class="metrics-item">
    <h3 class="metrics-item__title">
      <span>{{ title }}</span>
      <v-btn
        small
        color="primary"
        @click="setAlert"
      >
        设置告警
      </v-btn>
    </h3>
    <v-row
      no-gutters
      class="metrics-item__filter"
    >
      <v-col
        v-for="(label, index) in labels"
        :key="label.text"
      >
        <v-autocomplete
          :value="labelpairs[label.text]"
          :label="label.text"
          :items="label.items"
          dense
          flat
          multiple
          solo
          :class="{ 'ml-4': index !== 0 }"
          attach
          hide-selected
          hide-details
          no-data-text="暂无可选数据"
          @focus="onLoadLabelFocus(label.text)"
          @change="onLabelChange($event, label.text)"
        >
          <template #selection="{ item, parent, index }">
            <v-chip
              v-if="index === 0"
              color="primary"
              small
              class="my-1"
            >
              {{ item }}
            </v-chip>
            <v-chip
              v-if="index === 1"
              color="primary"
              small
              class="my-1"
            >
              +{{ parent.value.length - 1 }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>

    <div
      class="metrics-item__chart"
      :class="`clear-zoom-${Scale.toString().replaceAll('.', '-')}`"
    >
      <div
        ref="container"
        class="metrics-item__container"
      >
        <MetricsLineChart
          :width="size.width"
          :height="size.height"
          :series="series"
          :unit="unit"
        />
      </div>
    </div>
  </v-card>
</template>

<script>
import { mapState } from "vuex";
import MetricsLineChart from "./MetricsLineChart";
import { debounce } from "@/utils/helpers";

export default {
  name: "MetricsItem",
  components: {
    MetricsLineChart,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    unit: {
      type: String,
      default: "",
    },
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
    ...mapState(["Scale"]),
    labels() {
      return Object.values(this.labelObject);
    },
    series() {
      return this.data.data.map((item) => {
        const m = item.metric;
        return {
          name: Object.keys(m).reduce(
            (pre, current) => pre + `${current}="${m[current]}" `,
            "",
          ),
          data: item.values,
        };
      });
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.onResize();
    });
    window.addEventListener("resize", this._onResize);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this._onResize);
  },
  methods: {
    onResize() {
      this.size = {
        width: this.$refs.container.offsetWidth,
        height: this.$refs.container.offsetHeight,
      };
    },
    setAlert() {
      const { resource, rule, unit, environment } = this.data._$origin;
      const labelpairs = {};
      for (const key in this.labelpairs) {
        if (this.labelpairs[key] && this.labelpairs[key].length) {
          labelpairs[key] = this.labelpairs[key].reduce(
            (pre, current, index, arr) =>
              pre + current + `${index === arr.length - 1 ? "" : "|"}`,
            "",
          );
        }
      }

      this.$emit("alert", {
        name: "",
        cluster: environment?.Cluster.ClusterName,
        namespace: environment?.Namespace,
        for: "1m",
        resource: resource._$value,
        rule: rule._$value,
        unit: unit?._$value,
        labelpairs,
        alertLevels: [],
        receivers: [],
      });
    },
    onLoadLabelFocus(label) {
      this.$emit("loadLabel", label);
    },
    onLabelChange(value, label) {
      this.$emit("change", { label, value });
    },
    // eslint-disable-next-line vue/no-unused-properties
    onRefresh() {
      this.$emit("refresh");
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

  &__filter {
    max-height: 48px;
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
