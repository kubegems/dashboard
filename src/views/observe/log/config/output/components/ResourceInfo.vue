<template>
  <div>
    <v-card>
      <v-sheet class="pa-2">
        <BaseListItemForDetail :mt="0" title="Output">
          <template #content>
            <BaseCollapseChips
              v-if="output && output.spec"
              id="r_output"
              :chips="Object.keys(output.spec) || []"
              icon="mdi-router-wireless"
              single-line
            />
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>
  </div>
</template>

<script>
  import { deepCopy } from '@/utils/helpers';

  export default {
    name: 'ResourceInfo',
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    data() {
      return {
        output: null,
      };
    },
    watch: {
      item() {
        this.output = deepCopy(this.item);
      },
    },
    mounted() {
      if (this.item) this.output = deepCopy(this.item);
    },
  };
</script>
