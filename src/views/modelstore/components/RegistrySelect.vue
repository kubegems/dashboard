<template>
  <v-sheet class="text-body-2 text--darken-1 d-flex align-center mx-1">
    <span class="text-body-2 mr-1">在线商店</span>
    <v-menu v-model="repoMenu" bottom class="mx-1 px-1" left offset-y origin="top center" transition="scale-transition">
      <template #activator="{ on }">
        <v-btn class="primary--text font-weight-medium" color="white" text v-on="on">
          {{ selectRepo.name }}
          <v-icon v-if="repoMenu" right> fas fa-angle-up </v-icon>
          <v-icon v-else right> fas fa-angle-down </v-icon>
        </v-btn>
      </template>
      <v-data-iterator class="file-iterator" hide-default-footer :items="[{ text: '在线商店', values: repoItems }]">
        <template #no-data>
          <v-card>
            <v-card-text> 暂无版本 </v-card-text>
          </v-card>
        </template>
        <template #default="props">
          <v-card v-for="item in props.items" :key="item.text" flat min-height="100">
            <v-list dense>
              <v-flex class="text-subtitle-2 text-center ma-2">
                <span>在线商店</span>
              </v-flex>
              <v-divider class="mx-2" />
              <v-list-item
                v-for="(repo, index) in item.values"
                :key="index"
                class="text-body-2 text-center font-weight-medium mx-2"
                link
                :style="repo.value === selectRepo.name ? `color: #1e88e5 !important;` : ``"
                @click="setRepo(repo)"
              >
                <v-list-item-content>
                  <span>{{ repo.text }}</span>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </template>
      </v-data-iterator>
    </v-menu>
  </v-sheet>
</template>

<script>
  import { getModelSourceList } from '@/api';

  export default {
    name: 'RegistrySelect',
    data() {
      return {
        repoMenu: false,
        repoItems: [],
        selectRepo: '',
      };
    },
    watch: {
      value: {
        handler(newValue) {
          if (newValue) {
            this.selectRepo = newValue;
          }
        },
        deep: true,
        immediate: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.modelSourceList();
      });
    },
    methods: {
      setRepo(repo) {
        this.selectRepo = repo;
        this.$emit('change', this.selectRepo);
        this.$emit('input', this.selectRepo);
        this.$router.replace({ query: { ...this.$route.query, registry: this.selectRepo.name } });
      },
      async modelSourceList() {
        const data = await getModelSourceList({ size: 1000, noprocessing: true });
        this.repoItems = data.list
          .filter((s) => {
            return s.enabled;
          })
          .map((s) => {
            return { text: s.name, value: s.name, ...s };
          });
        if (this.$route.query.registry) {
          this.selectRepo = this.repoItems.find((r) => {
            return r.name === this.$route.query.registry;
          });
          this.$emit('change', this.selectRepo);
          this.$emit('input', this.selectRepo);
        } else if (this.repoItems.length > 0) {
          this.selectRepo = this.repoItems[0];
          this.$emit('change', this.selectRepo);
          this.$emit('input', this.selectRepo);
        }
      },
    },
  };
</script>
