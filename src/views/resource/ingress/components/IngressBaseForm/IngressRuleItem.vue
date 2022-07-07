<template>
  <v-flex>
    <v-sheet v-for="(item, index) in rules" :key="index" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-subtitle-2 py-1 primary--text">
            <v-chip class="mr-2" color="primary" x-small>
              {{ getProtocol(item, tls) }}
            </v-chip>
            <span>{{ item.host }}</span>
          </v-list-item-subtitle>
          <v-list-item-content v-for="(path, i) in item.http.paths" :key="i">
            <v-row>
              <v-col class="py-1" cols="4">
                <span class="text-body-2">路径:</span>
                <span class="text-subtitle-2">{{ path.path }}</span>
              </v-col>
              <v-col class="py-1" cols="4">
                <span class="text-body-2">服务:</span>
                <span class="text-subtitle-2">
                  {{ path.backend.service.name }}
                </span>
              </v-col>
              <v-col class="py-1" cols="4">
                <span class="text-body-2">端口:</span>
                <span class="text-subtitle-2">
                  {{ path.backend.service.port.name }}
                </span>
              </v-col>
            </v-row>
          </v-list-item-content>
        </v-list-item-content>
        <v-btn color="primary" dark fab right text x-small @click="updatePort(index)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn color="error" dark fab right text x-small @click="removePort(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn color="primary" text @click="expandCard">
              <v-icon left small> mdi-plus </v-icon>
              添加规则
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  export default {
    name: 'IngressRuleItem',
    props: {
      obj: {
        type: Object,
        default: () => {},
      },
      rules: {
        type: Array,
        default: () => [],
      },
      tls: {
        type: Array,
        default: () => [],
      },
    },
    methods: {
      updatePort(index) {
        this.$emit('updatePort', index);
      },
      removePort(index) {
        this.$emit('removePort', index);
      },
      expandCard() {
        this.$emit('expandCard', 'ingressRuleForm');
      },
      getProtocol(rule, tls) {
        let basePrefix = 'http';
        let prefix = 'http';
        if (this.obj.metadata.annotations) {
          if (this.obj.metadata.annotations['nginx.org/websocket-services']) {
            if (
              rule.http.paths.find((p) => {
                return (
                  this.obj.metadata.annotations['nginx.org/websocket-services']
                    .split(',')
                    .indexOf(p.backend.serviceName) > -1
                );
              })
            ) {
              basePrefix = 'ws';
              prefix = 'ws';
            }
          } else if (this.obj.metadata.annotations['nginx.org/grpc-services']) {
            if (
              rule.http.paths.find((p) => {
                return (
                  this.obj.metadata.annotations['nginx.org/grpc-services'].split(',').indexOf(p.backend.serviceName) >
                  -1
                );
              })
            ) {
              basePrefix = 'grpc';
              prefix = 'grpc';
            }
          }
        }
        if (tls) {
          tls.forEach((t) => {
            const i = t.hosts.findIndex((h) => {
              return h === rule.host;
            });
            if (i > -1) {
              if (basePrefix === 'http') prefix = 'https';
              else if (basePrefix === 'ws') prefix = 'wss';
              else if (basePrefix === 'grpc') prefix = 'grpc';
              return;
            }
          });
        }
        return `${prefix}`;
      },
    },
  };
</script>
