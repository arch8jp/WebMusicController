<template>
  <v-container>
    <h1>Login Succeeded!</h1>
    <button @click="logout">Logout</button>
  </v-container>
</template>

<script>
export default {
  middleware: ['auth'],
  methods: {
    logout() {
      this.$auth.logout()
    },
  },
}
</script>
