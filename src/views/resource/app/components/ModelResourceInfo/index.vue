<template>
  <div class="mt-6">
    <DashboardCard :item="item" />

    <v-card class="mt-3">
      <v-sheet class="pa-2">
        <BaseListItemForDetail title="API地址">
          <template #content>
            <v-chip color="primary" small>
              {{ item ? item.spec.host : '' }}
              <v-btn icon small @click="openAPIAddress(item.spec.host)">
                <v-icon color="white" small> mdi-open-in-new </v-icon>
              </v-btn>
            </v-chip>
          </template>
        </BaseListItemForDetail>

        <BaseListItemForDetail title="内部地址">
          <template #content>
            {{ item ? item.spec.host : '' }}
          </template>
        </BaseListItemForDetail>
      </v-sheet>
    </v-card>
  </div>
</template>

<script>
  import DashboardCard from './DashboardCard';

  export default {
    name: 'ModelResourceInfo',
    components: {
      DashboardCard,
    },
    props: {
      item: {
        type: Object,
        default: () => null,
      },
    },
    methods: {
      openAPIAddress(address) {
        window.open(`http://${address}`);
      },
    },
  };
</script>
