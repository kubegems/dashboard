<template>
  <v-row class="mt-0">
    <v-col v-for="(item, index) in items" :key="index" class="pt-0" cols="3">
      <v-hover #default="{ hover }">
        <v-card class="mx-auto" :elevation="hover ? 5 : 0" height="100%">
          <v-list-item three-line>
            <v-list-item-avatar size="80" tile>
              <BaseLogo icon-name="nvidia" :width="60" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="text-h6 mb-1">
                <a @click="modelDetail(item)">MMRotate</a>
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2 text--lighten-4"> text generation </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-card-actions>
            <v-list-item>
              <v-list-item-content class="py-0">
                <v-list-item-subtitle class="text-body-2 text--lighten-4">
                  <v-rating background-color="orange lighten-3" color="orange" small />
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-spacer />
            <v-btn color="primary" small text> 详情 </v-btn>
          </v-card-actions>
        </v-card>
      </v-hover>
    </v-col>
    <v-col class="pt-0 pb-3" cols="3">
      <v-card class="kubegems__full-height" min-height="176">
        <v-card-text class="pa-0 kubegems__full-height">
          <v-list-item class="kubegems__full-height" three-line>
            <v-list-item-content>
              <v-btn block class="text-h6" color="primary" text @click="addModel">
                <v-icon left>mdi-plus-box</v-icon>
                添加模型
              </v-btn>
            </v-list-item-content>
          </v-list-item>
        </v-card-text>
      </v-card>
    </v-col>

    <AddModel ref="addModel" />
  </v-row>
</template>

<script>
  import AddModel from './AddModel';

  export default {
    name: 'ModelCard',
    components: {
      AddModel,
    },
    data() {
      return {
        items: [1],
      };
    },
    methods: {
      modelDetail() {
        this.$router.push({
          name: 'modelstore-detail',
          params: {
            name: 'nvidia',
          },
        });
      },
      addModel() {
        this.$refs.addModel.open();
      },
    },
  };
</script>
