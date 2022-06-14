<template>
  <div class="d-inline-block">
    <template v-if="mode === 'default'">
      <ClusterSelectItem
        v-for="item in items"
        :key="item.value"
        :active="current === item[valueKey]"
        class="mr-3"
        :disabled="disabled"
        @click="onSelect(item)"
      >
        集群{{ item.text }}
      </ClusterSelectItem>
    </template>
    <template v-else>
      <v-badge
        v-for="item in items"
        :key="item.value"
        bordered
        class="mr-3"
        color="success"
        :content="badgeValues[item[valueKey]]"
        overlap
        small
        :value="badgeValues[item[valueKey]] !== undefined"
      >
        <ClusterSelectItem :active="current === item[valueKey]" :disabled="disabled" @click="onSelect(item)">
          集群{{ item.text }}
        </ClusterSelectItem>
      </v-badge>
    </template>
  </div>
</template>

<script>
  import { mapState, mapGetters } from 'vuex';

  import ClusterSelectItem from './Item';

  import { clusterSelectData, tenantClusterSelectData } from '@/api';
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ClusterSelect',
    components: {
      ClusterSelectItem,
    },
    props: {
      autoSelectFirst: {
        type: Boolean,
        default: false,
      },
      badgeValues: {
        type: Object,
        default: () => ({}),
      },
      clearable: {
        type: Boolean,
        default: false,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      mode: {
        type: String,
        default: 'default',
        validator: (v) => ['default', 'badge'].includes(v),
      },
      objectValue: {
        type: Boolean,
        default: false,
      },
      tenant: {
        type: Boolean,
        default: false,
      },
      tid: {
        type: Number,
        default: 0,
      },
      value: {
        type: [Number, String, Object],
        default: undefined,
      },
      valueKey: {
        type: String,
        default: 'text',
        validator: (v) => ['text', 'value'].includes(v),
      },
    },
    data() {
      return {
        items: [],
        current: undefined,
      };
    },
    computed: {
      ...mapState(['AdminViewport', 'Admin']),
      ...mapGetters(['Tenant']),
    },
    watch: {
      value: {
        handler(newValue) {
          this.current = newValue && this.objectValue ? newValue?.[this.valueKey] : newValue;
        },
        immediate: true,
      },
      tid: {
        handler(oldValue, newValue) {
          if (oldValue !== newValue) {
            this.getClusters();
          }
        },
        deep: true,
      },
    },
    mounted() {
      if (!this.tenant) {
        this.getClusters();
      }
    },
    methods: {
      async getClusters() {
        let data = null;
        if (this.AdminViewport && !this.tenant) {
          data = await clusterSelectData({ noprocessing: true });
        } else {
          data = await tenantClusterSelectData(this.tid || this.Tenant().ID, {
            noprocessing: true,
          });
        }
        this.items = data.List.map((item) => ({
          text: item?.Cluster?.ClusterName || item.ClusterName,
          value: item.ClusterID || item.ID,
        }));
        if (!this.current && this.autoSelectFirst && this.items.length) {
          this.onSelect(this.items[0]);
        }
      },
      onEmit(value) {
        const v = this.objectValue ? deepCopy(value) : this.current;
        this.$emit('input', v);
        this.$emit('change', v);
      },
      onSelect(value) {
        if (this.current === value[this.valueKey]) {
          if (this.clearable) {
            this.current = undefined;
            this.onEmit(value);
          }
        } else {
          this.current = value[this.valueKey];
          this.onEmit(value);
        }
      },
      // eslint-disable-next-line vue/no-unused-properties
      getItems() {
        return this.items;
      },
    },
  };
</script>
