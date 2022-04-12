<template>
  <v-flex class="kubegems__full-right">
    <v-sheet class="text-body-2 text--darken-1 d-flex align-center mx-1">
      <span class="text-body-2 mt-1 mr-1">租户</span>
      <v-menu
        v-model="tenantMenu"
        bottom
        left
        offset-y
        origin="top center"
        transition="scale-transition"
        class="mx-1 px-1"
      >
        <template #activator="{ on }">
          <v-btn
            text
            color="white"
            class="primary--text font-weight-medium"
            v-on="on"
          >
            {{ tenant }}
            <v-icon
              v-if="tenantMenu"
              right
            >
              fas fa-angle-up
            </v-icon>
            <v-icon
              v-else
              right
            >
              fas fa-angle-down
            </v-icon>
          </v-btn>
        </template>
        <v-data-iterator
          :items="[{ text: '租户', values: tenants }]"
          hide-default-footer
          class="file-iterator"
        >
          <template #no-data>
            <v-card>
              <v-card-text> 暂无租户 </v-card-text>
            </v-card>
          </template>
          <template #default="props">
            <v-card
              v-for="item in props.items"
              :key="item.text"
            >
              <v-list dense>
                <v-list-item
                  v-for="(ten, index) in item.values"
                  :key="index"
                  class="text-body-2 text-center font-weight-medium"
                  link
                  :style="
                    ten.text === tenant
                      ? `color: #1e88e5 !important;`
                      : ``
                  "
                  @click="setTenant(ten)"
                >
                  <v-list-item-content>
                    <span>{{ ten.text }}</span>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </template>
        </v-data-iterator>
      </v-menu>
    </v-sheet>
  </v-flex>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseSelect from '@/mixins/select'

export default {
  name: 'TenantSelect',
  mixins: [BaseSelect],
  data () {
    return {
      tenantMenu: false,
      tenant: '',
    }
  },
  computed: {
    ...mapGetters(['Tenant']),
    tenants() {
      return this.m_select_tenantItems.filter(t => { return t.isActive && !t.disabled })
    },
  },
  mounted() {
    this.$nextTick(async() => {
      await this.m_select_tenantSelectData()
      if (this.tenants) {
        this.tenant = this.tenants[0].text
        this.$emit('loadMetrics', this.tenant)
      } else {
        this.$store.commit('SET_SNACKBAR', {
          text: '暂无租户',
          color: 'warning',
        })
      }
    })
  },
  methods: {
    setTenant(tenant) {
      if (tenant.text !== this.tenant) {
        this.tenant = tenant.text
        this.$emit('loadMetrics', this.tenant)
      }
    },
  },
}
</script>
