<template>
  <v-flex>
    <BaseSubTitle
      v-if="pathLevel === 1"
      :title="label"
      :color="pathLevel === 1 ? 'grey lighten-3' : ''"
      class="mb-4"
      :divider="false"
    />
    <v-combobox
      v-model="selectedItems"
      :items="items"
      :attach="`#${id}`"
      :search-input.sync="search"
      :label="pathLevel === 1 ? '' : label"
      multiple
      hide-selected
      class="my-2"
      :menu-props="{
        bottom: true,
        left: true,
        origin: `top center`,
      }"
      @change="onChange($event)"
    >
      <template #no-data>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>
              {{ search }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
      <template #selection="{ item }">
        <v-chip small dense color="success" class="ma-1">
          {{ item }}
          <v-icon small @click="removeCommand(item)"> mdi-close </v-icon>
        </v-chip>
      </template>
      <template #append-outer><v-flex :id="id" /></template>
    </v-combobox>
  </v-flex>
</template>

<script>
  import BaseSelect from '@/mixins/select';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'MultiSelectParamParam',
    mixins: [BaseSelect, BaseResource],
    props: {
      label: {
        type: String,
        default: () => '',
      },
      param: {
        type: Object,
        default: () => {},
      },
      id: {
        type: String,
        default: () => '',
      },
    },
    data: () => ({
      items: [],
      selectedItems: [],
      search: null,
    }),
    computed: {
      pathLevel() {
        return this.param.path.split('/').length;
      },
    },
    mounted() {
      // yaml seq 序列转json的array
      if (this.param.items && this.param.items.enum && this.param.items.enum.length > 0) {
        const enums = this.param.items.enum;
        // 去重
        this.items = [...new Set(enums)];
      }
      if (this.param.default && this.param.default.length > 0) {
        this.selectedItems = this.param.default;
      }
      this.onChange(this.selectedItems);
    },
    methods: {
      onChange(event) {
        this.$emit('changeBasicFormParam', this.param, event);
      },
      removeCommand(item) {
        const tmp = this.selectedItems.filter((selectItem) => {
          return selectItem !== item;
        });
        this.selectedItems = tmp;
        this.$emit('changeBasicFormParam', this.param, this.selectedItems);
      },
    },
  };
</script>
