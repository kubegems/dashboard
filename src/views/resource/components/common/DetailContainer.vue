<template>
  <v-simple-table class="mx-2 pa-2 pb-3">
    <template #default>
      <thead>
        <tr>
          <th class="text-left">容器名</th>
          <th
            class="text-left"
            style="width: 300px;"
          >
            镜像
          </th>
          <th
            class="text-left"
            style="width: 120px;"
          >
            探针
          </th>
          <th class="text-left">容器端口</th>
          <th
            class="text-left"
            style="width: 220px;"
          >
            卷
          </th>
          <th class="text-left">卷挂载</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, i) in containers"
          :key="`${item.name}${i}`"
        >
          <td>{{ item.name }}</td>
          <td>{{ item.image }}</td>
          <td>
            <template v-if="item.livenessProbe">
              <ProbeTip
                title="存活探针"
                :item="item.livenessProbe"
              />
            </template>
            <template v-if="item.readinessProbe">
              <ProbeTip
                title="就绪探针"
                :item="item.readinessProbe"
              />
            </template>
            <template v-if="item.startupProbe">
              <ProbeTip
                title="启动探针"
                :item="item.startupProbe"
              />
            </template>
          </td>
          <td>
            <BaseCollapseChips
              v-if="item"
              :chips="ports[item.name] || []"
              single-line
              icon="mdi-directions-fork"
            />
          </td>
          <td>
            <v-flex
              v-for="(volume, index) in item.volumeMounts"
              :key="index"
              class="py-1"
            >
              <div class="table__volume__height">{{ volume.name }}</div>
            </v-flex>
          </td>
          <td>
            <v-flex
              v-for="(volume, index) in item.volumeMounts"
              :key="index"
              class="py-1"
            >
              <div class="table__volume__height">
                <span>{{ volume.mountPath }}</span>
                <span v-if="volume.subPath">
                  ｜子路径 : {{ volume.subPath }}
                </span>
              </div>
            </v-flex>
          </td>
        </tr>
      </tbody>
    </template>
  </v-simple-table>
</template>

<script>
import ProbeTip from './ProbeTip'

export default {
  name: 'DetailContainer',
  components: {
    ProbeTip,
  },
  props: {
    containers: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      ports: {},
    }
  },
  watch: {
    containers() {
      this.ports = {}
      this.containers.forEach((c) => {
        this.ports[c.name] = []
        if (c.ports) {
          c.ports.forEach((p) => {
            this.ports[c.name].push(`${p.containerPort} | ${p.protocol}`)
          })
        }
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.table {
  &__volume {
    &__height {
      height: 24px;
      overflow: auto;
      word-break: break-all;
      white-space: break-spaces;
    }
  }
}
</style>
