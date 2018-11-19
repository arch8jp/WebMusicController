<template>
  <div>
    <v-app>
      <page-header />
      <v-content>
        <nuxt />
      </v-content>
      <page-footer />
    </v-app>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'

import pageHeader from '~/components/Header.vue'
import pageFooter from '~/components/Footer.vue'

export default {
  components: {
    pageHeader,
    pageFooter,
  },
}
</script>
