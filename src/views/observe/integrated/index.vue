<template>
  <v-container fluid>
    <BaseBreadcrumb />

    <div v-for="item in items" :key="`${item.name}`">
      <v-flex class="kubegems__text text-subtitle-1 mt-3 font-weight-medium">
        {{ item.name }}
      </v-flex>

      <v-row :key="`${item.name}i`" class="mt-3">
        <v-col v-for="index in item.harfItems" :key="index" class="pt-0" :cols="3">
          <v-row>
            <v-col v-for="innerIndex in [0, 1]" :key="innerIndex" :cols="6">
              <template v-if="item.items[index * 2 + innerIndex]">
                <v-hover #default="{ hover }">
                  <v-card
                    class="mx-auto"
                    :elevation="hover ? 5 : 0"
                    @click="configIntergated(item.items[index * 2 + innerIndex], item.type)"
                  >
                    <v-list-item>
                      <v-list-item-avatar
                        class="mb-0 text-center"
                        size="80"
                        :style="{
                          left: '50%',
                          transform: 'translate(-55%, 0%)',
                        }"
                        tile
                      >
                        <BaseLogo :icon-name="item.items[index * 2 + innerIndex].name" :width="70" />
                      </v-list-item-avatar>
                    </v-list-item>
                    <div class="text-center text-body-1 pb-2 kubegems__text font-weight-medium">
                      {{ item.items[index * 2 + innerIndex].name }}
                    </div>
                  </v-card>
                </v-hover>
              </template>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>

    <IntergatedCenter ref="intergatedCenter" />
  </v-container>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';

  import IntergatedCenter from './components/IntergatedCenter';
  import BasePermission from '@/mixins/permission';
  import BaseResource from '@/mixins/resource';

  export default {
    name: 'Intergated',
    components: {
      IntergatedCenter,
    },
    mixins: [BasePermission, BaseResource],
    data: () => ({
      items: {
        app: {
          name: '应用类型',
          type: 'app',
          items: [
            { name: 'c++', value: 'cpp' },
            { name: 'c#', value: 'csharp' },
            { name: 'golang' },
            { name: 'erlang' },
            { name: 'python' },
            { name: 'swift' },
            { name: 'ruby' },
            { name: 'rust' },
            { name: 'java' },
            { name: 'javascript' },
            { name: 'nodejs' },
            { name: 'php' },
          ],
          harfItems: [...new Array(6).keys()],
        },
        middleware: {
          name: '中间件',
          type: 'middleware',
          items: [
            { name: 'cassandra', chart: 'prometheus-cassandra-exporter' },
            { name: 'elasticsearch', chart: 'prometheus-elasticsearch-exporter' },
            { name: 'memcached', chart: 'prometheus-memcached-exporter' },
            { name: 'mongodb', chart: 'prometheus-mongodb-exporter' },
            { name: 'mysql', chart: 'prometheus-mysql-exporter' },
            { name: 'rabbitmq', chart: 'prometheus-rabbitmq-exporter' },
            { name: 'redis', chart: 'prometheus-redis-exporter' },
          ],
          harfItems: [...new Array(5).keys()],
        },
        logging: {
          name: '监控/日志',
          type: 'monitor',
          items: [{ name: '日志采集' }, { name: 'Prometheus Exporter' }],
          harfItems: [...new Array(5).keys()],
        },
      },
    }),
    computed: {
      ...mapState(['JWT', 'AdminViewport']),
      ...mapGetters(['Cluster']),
    },
    mounted() {},
    methods: {
      configIntergated(item, type) {
        this.$refs.intergatedCenter.init(item, type);
        this.$refs.intergatedCenter.open();
      },
    },
  };
</script>
