<template>
  <v-row>
    <v-col cols="6">
      <v-text-field
        v-model="obj.prepare_value"
        label="prepare_value"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.char_encoding"
        label="char_encoding"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.remove_keys"
        label="remove_keys"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.inject_key_prefix"
        label="inject_key_prefix"
      />
    </v-col>
    <v-col cols="6">
      <v-text-field
        v-model="obj.whitelist_keys"
        label="whitelist_keys"
      />
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: 'RecordModifier',
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      obj: {
        inject_key_prefix: undefined,
        remove_keys: undefined,
        whitelist_keys: undefined,
        prepare_value: undefined,
        char_encoding: undefined,
        replaces: [],
        records: [],
      },
    }
  },
  watch: {
    data: {
      handler (newValue) {
        this.obj = { ...this.obj, ...newValue }
      },
      immediate: true,
    },
  },
  methods: {
    // eslint-disable-next-line vue/no-unused-properties
    getValue () {
      return {
        record_modifier: { ...this.obj },
      }
    },
  },
}
</script>
