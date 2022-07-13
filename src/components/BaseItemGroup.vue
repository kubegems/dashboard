<template>
  <v-list-group
    v-model="open"
    :active-class="`primary white--text`"
    :prepend-icon="item.meta.icon"
    :sub-group="subGroup"
  >
    <template #activator>
      <v-list-item-icon v-if="item.meta.sicon" class="sicon">
        <v-icon v-text="item.meta.sicon" />
      </v-list-item-icon>

      <v-list-item-content>
        <v-list-item-title v-text="item.meta.title" />
      </v-list-item-content>
    </template>

    <template v-for="(child, i) in children">
      <BaseItemSubGroup v-if="child.children" :key="`sub-group-${i}`" class="second-dd" :item="child" />

      <BaseItem
        v-else-if="child.meta.show || (pluginPass(child.meta.dependencies) && child.meta.pluginOpenShow)"
        :key="`item-${i}`"
        :item="child"
        text
      />
    </template>
  </v-list-group>
</template>

<script>
  import { mapState } from 'vuex';

  export default {
    name: 'BaseItemGroup',

    inheritAttrs: false,

    props: {
      item: {
        type: Object,
        default: () => ({
          avatar: undefined,
          group: undefined,
          title: undefined,
          children: [],
        }),
      },
      subGroup: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      ...mapState(['Plugins']),
      children() {
        return this.item.children
          .filter((item) => {
            return (
              (!item.children &&
                (item.meta.show || (this.pluginPass(item.meta.dependencies) && item.meta.pluginOpenShow))) ||
              item.children
            );
          })
          .map((item) => ({
            ...item,
            to: this.$router.resolve({ name: item.name, params: { ...this.$route.params } }).href,
          }));
      },
      open: {
        get() {
          return this.genGroup(this.item.children);
        },
        set() {},
      },
    },

    methods: {
      genGroup(children) {
        return (
          children
            .map((item) => {
              let group = `${item.name}`;

              if (item.children) {
                group = `${group}|${this.genGroup(item.children)}`;
              }
              return group;
            })
            .indexOf(this.$route.name) > -1
        );
      },
      pluginPass(dependencies) {
        let pass = true;
        if (dependencies === undefined) return pass;
        dependencies.forEach((d) => {
          if (!this.Plugins[d]) {
            pass = false;
            return;
          }
        });
        return pass;
      },
    },
  };
</script>
