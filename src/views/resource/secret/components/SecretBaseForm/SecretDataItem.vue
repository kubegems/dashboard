<template>
  <v-flex>
    <v-sheet v-for="(value, key) in data" :key="key" class="grey lighten-4 rounded mb-3">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-title class="text-subtitle-2 py-1 primary--text">
            {{ key }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-body-2 py-1">
            {{ value.substr(0, 6) + '************' }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-btn dark text fab right x-small color="primary" @click="updateData(key)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <v-btn dark text fab right x-small color="error" @click="removeData(key)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-list-item>
    </v-sheet>
    <v-flex class="grey lighten-4 rounded">
      <v-list-item two-line>
        <v-list-item-content class="py-2">
          <v-list-item-subtitle class="text-body-2 py-0 text-center">
            <v-btn text color="primary" @click="expandCard">
              <v-icon left small> mdi-tag-plus </v-icon>
              添加密钥项
            </v-btn>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-flex>
  </v-flex>
</template>

<script>
  export default {
    name: 'SecretDataItem',
    props: {
      data: {
        type: Object,
        default: () => {},
      },
    },
    methods: {
      updateData(key) {
        this.$emit('updateData', key);
      },
      removeData(key) {
        this.$emit('removeData', key);
      },
      expandCard() {
        this.$emit('expandCard');
      },
    },
  };
</script>
