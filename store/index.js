import Vuex from 'vuex'

export default () => new Vuex.Store({
  state: {
    isConnected: false,
    connect_guild: '',
    connect_guildid: '',
    connect_channel: '',
    snack_visible: false,
    snack_message: '',
    snack_color: '',
  },
  getters: {},
  actions: {},
  mutations: {
    connect_ready(state, data) {
      state.connect_guild = data.guild
      state.connect_guildid = data.id
      state.connect_channel = data.channel
      state.isConnected = true
    },
    connect_disconnect(state) {
      state.connect_guild = ''
      state.connect_guildid = ''
      state.connect_channel = ''
      state.isConnected = false
    },
  },
})
