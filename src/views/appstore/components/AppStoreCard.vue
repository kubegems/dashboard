<template>
  <v-hover #default="{ hover }">
    <v-card class="mx-auto" :elevation="hover ? 5 : 0" height="100%">
      <v-list-item three-line>
        <v-list-item-avatar size="80" tile>
          <BaseLogo :icon-name="app.name" :width="60" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="text-h6 mb-1">
            <a @click="appStoreDetail(app)">{{ app.name }}</a>
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 text--lighten-4">
            简介：{{ app.description === '' ? '-' : app.description }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-card-actions>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-subtitle class="text-body-2 text--lighten-4">
              版本：{{ app.appVersion === '' ? '-' : app.appVersion }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-spacer />
        <v-btn color="primary" small text @click="appStoreDetail(app)"> 详情 </v-btn>
      </v-card-actions>
    </v-card>
  </v-hover>
</template>

<script>
  export default {
    name: 'AppStoreCard',
    props: {
      app: {
        type: Object,
        default: () => {},
      },
      selectRepo: {
        type: String,
        default: () => '',
      },
    },
    methods: {
      appStoreDetail(app) {
        this.$router.push({
          name: 'appstore-detail',
          params: { name: app.name },
          query: { reponame: this.selectRepo },
        });
      },
    },
  };
</script>
