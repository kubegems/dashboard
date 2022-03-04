<template>
  <v-flex>
    <v-form
      ref="form"
      v-model="valid"
      lazy-validation
    >
      <BaseSubTitle title="关联应用" />
      <v-card-text class="px-2 pb-0">
        <v-sheet>
          <v-autocomplete
            v-model="obj"
            color="primary"
            :items="items"
            :rules="objRules.ApplicationRule"
            label="应用"
            hide-selected
            class="my-0"
            no-data-text="暂无可选数据"
            @focus="onAppSelectFocus"
          >
            <template #selection="{ item }">
              <v-chip
                color="primary"
                small
                class="mx-1"
              >
                {{ item['text'] }}
              </v-chip>
            </template>
          </v-autocomplete>
        </v-sheet>
      </v-card-text>
    </v-form>
  </v-flex>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { getManifestList } from '@/api'
import BaseSelect from '@/mixins/select'
import { required } from '@/utils/rules'

export default {
  name: 'LinkAppBaseForm',
  mixins: [BaseSelect],
  data: () => ({
    valid: false,
    items: [],
    obj: {},
    objRules: {
      ApplicationRule: [required],
    },
  }),
  computed: {
    ...mapState(['AdminViewport']),
    ...mapGetters(['Project', 'Tenant']),
  },
  methods: {
    async appManifestList() {
      const data = await getManifestList(this.Tenant().ID, this.Project().ID, {
        size: 1000,
        noprocessing: true,
      })
      const apps = []
      data.List.forEach((app) => {
        apps.push({ text: app.name, value: app })
      })
      this.items = apps
    },
    // eslint-disable-next-line vue/no-unused-properties
    reset() {
      this.$refs.form.reset()
    },
    onAppSelectFocus() {
      this.appManifestList()
    },
  },
}
</script>
