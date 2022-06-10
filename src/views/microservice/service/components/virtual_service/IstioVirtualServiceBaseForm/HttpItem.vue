<template>
  <v-flex>
    <v-sheet v-for="(t, index) in http" :key="index" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0">
            <v-list-item two-line class="float-left py-0 pl-0" style="width: 300px">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ t.match ? t.match.length : 0 }} 条匹配策略
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> match </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item two-line class="float-left py-0 pl-0" style="width: 300px">
              <v-list-item-content class="py-0">
                <v-list-item-title class="text-subtitle-2 py-1">
                  {{ t.route ? t.route.length : 0 }} 条路由策略
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-2 py-1"> route </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-subtitle>
          <div class="kubegems__clear-float" />
        </v-list-item-content>
        <v-btn dark text fab right x-small color="primary" @click="updateHttp(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn dark text fab right x-small color="error" @click="removeHttp(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn text color="primary" @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加http流量策略
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  export default {
    name: 'HttpItem',
    props: {
      http: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      updateHttp(index) {
        this.$emit('updateHttp', index);
      },
      removeHttp(index) {
        this.$emit('removeHttp', index);
      },
      expandCard() {
        this.$emit('expandCard', 'httpForm');
      },
    },
  };
</script>
