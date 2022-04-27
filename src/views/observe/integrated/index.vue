<template>
  <v-container fluid>
    <BaseBreadcrumb :breadcrumb="breadcrumb" />

    <v-flex class="kubegems__role text-subtitle-1 mt-3 font-weight-medium">
      应用类型
    </v-flex>

    <v-row class="mt-0">
      <v-col
        v-for="index in harfItems"
        :key="index"
        :cols="3"
      >
        <v-row>
          <v-col
            v-for="innerIndex in [0,1]"
            :key="innerIndex"
            :cols="6"
          >
            <template v-if="items[index*2 + innerIndex]">
              <v-hover #default="{ hover }">
                <v-card
                  class="mx-auto intergate-pos"
                  :elevation="hover ? 5 : 0"
                >
                  <v-list-item>
                    <v-list-item-avatar
                      tile
                      size="80"
                      class="mb-0 text-center"
                      :style="{
                        left: '50%',
                        transform: 'translate(-55%, 0%)'
                      }"
                    >
                      <BaseLogo
                        :icon-name="items[index*2 + innerIndex].name"
                        :width="70"
                      />
                    </v-list-item-avatar>
                  </v-list-item>
                  <div class="text-center text-body-1 mb-2">
                    {{ items[index*2 + innerIndex].name }}
                  </div>

                  <!-- <v-flex
                    class="intergate-watermark-bg"
                  />
                  <v-flex
                    class="intergate-watermark font-weight-medium"
                  >
                    已接入
                  </v-flex> -->
                </v-card>
              </v-hover>
            </template>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import BaseResource from '@/mixins/resource'
import BasePermission from '@/mixins/permission'

export default {
  name: 'Intergated',
  mixins: [BaseResource, BasePermission],
  data: () => ({
    breadcrumb: {
      title: '接入中心',
      tip: '',
      icon: 'mdi-widgets',
    },
    items: [
      { name: 'c++' },
      { name: 'c#' },
      { name: 'golang' },
      { name: 'erlang' },
      { name: 'python' },
      { name: 'swift' },
      { name: 'ruby' },
      { name: 'rust' },
      { name: 'java' },
      { name: 'javascript' },
      { name: 'php' },
    ],
  }),
  computed: {
    ...mapState(['JWT', 'AdminViewport']),
    ...mapGetters(['Cluster']),
    harfItems() {
      return [...new Array(parseInt(this.items.length / 2 + 1)).keys()]
    },
  },
  mounted() {

  },
  methods: {

  },
}
</script>

<style lang="scss" scoped>
.intergate-pos {
  position: relative;
  background-color: #ffffff;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.intergate-watermark-bg {
  position: absolute;
  width: 98px;
  height: 83px;
  transform: rotate(47deg);
  top: -46px;
  right: -55px;
  background-color: #1e88e5;
  padding: 0;
}

.intergate-watermark {
  position: absolute;
  top: 10px;
  right: -3px;
  transform: rotate(47deg);
  text-transform: uppercase;
  color: white;
  font-size: 12px;
}
</style>
