<template>
  <v-flex>
    <v-form ref="form" v-model="valid" lazy-validation @submit.prevent>
      <BaseSubTitle title="关联应用" />
      <v-card-text class="px-2 pb-0">
        <v-sheet>
          <v-autocomplete
            v-model="obj"
            class="my-0"
            color="primary"
            hide-selected
            :items="items"
            label="应用"
            multiple
            no-data-text="暂无可选数据"
            :rules="objRules.ApplicationRule"
            @focus="onAppSelectFocus"
          >
            <template #selection="{ item }">
              <v-chip class="mx-1" color="primary" small>
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
  import { mapGetters, mapState } from 'vuex';

  import { getAppRunningList, getManifestList } from '@/api';
  import BaseSelect from '@/mixins/select';
  import { required } from '@/utils/rules';

  export default {
    name: 'LinkAppBaseForm',
    mixins: [BaseSelect],
    data: () => ({
      valid: false,
      items: [],
      obj: [],
      objRules: {
        ApplicationRule: [required],
      },
      linkedAppItems: [],
    }),
    computed: {
      ...mapState(['AdminViewport']),
      ...mapGetters(['Project', 'Tenant', 'Environment']),
    },
    methods: {
      async appManifestList() {
        const data = await getManifestList(this.Tenant().ID, this.Project().ID, {
          size: 1000,
        });
        const apps = [];
        data.List.forEach((app) => {
          if (
            this.linkedAppItems.some((l) => {
              return l.name === app.name;
            })
          ) {
            apps.push({ text: `${app.name}(已关联)`, value: app, disabled: true });
          } else {
            apps.push({ text: app.name, value: app, disabled: false });
          }
        });
        this.items = apps;
      },
      async appRunningList() {
        const data = await getAppRunningList(
          this.Tenant().ID,
          this.Project().ID,
          this.Environment().ID,
          Object.assign({
            kind: 'app',
            noprocessing: true,
            size: 1000,
          }),
        );
        this.linkedAppItems = data.List;
      },
      reset() {
        this.$refs.form.reset();
      },
      getData() {
        return this.obj;
      },
      validate() {
        return this.$refs.form.validate(true);
      },
      async onAppSelectFocus() {
        await this.appRunningList();
        this.appManifestList();
      },
    },
  };
</script>
