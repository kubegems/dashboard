<template>
  <v-menu open-on-hover :nudge-width="200" offset-x>
    <template #activator="{ on, attrs }">
      <v-icon small v-bind="attrs" color="warning" v-on="on"> mdi-alert-circle </v-icon>
    </template>
    <v-card max-width="300">
      <v-list dense>
        <v-flex class="text-subtitle-2 text-center ma-2">
          <span>第三方仓库</span>
        </v-flex>
        <v-divider class="mx-2" />
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>建议:</v-list-item-title>
            <v-list-item-content class="text-body-2 kubegems__text">
              {{ msg }}
            </v-list-item-content>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script>
  export default {
    name: 'Tips',
    props: {
      msg: {
        type: String,
        default: () => '',
      },
    },
  };
</script>
