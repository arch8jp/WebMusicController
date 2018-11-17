<template>
  <v-container>
    <h1>index</h1>
    <button @click="login">Login</button>
  </v-container>
</template>

<script>
export default {
  methods: {
    login() {
      this.$auth.loginWith('discord')
    },
  },
}
</script>
