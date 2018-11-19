<template>
  <div>
    <div v-if="isConnected">
      <v-container grid-list-lg>

        <v-layout row wrap>

          <v-flex xs12>
            <v-alert :value="error" color="error" icon="warning" transition="scale-transition">
              {{ messages[error] }}
            </v-alert>
          </v-flex>

          <v-flex xs12>
            <v-card>

              <v-card-title primary-title>
                <h3 class="headline mb-0"><v-icon large>playlist_play</v-icon> Now Playing</h3>
              </v-card-title>

              <v-card-text v-if="queue.length > 0">
                <v-list>
                  <v-list-tile v-for="(item, key) in queue" :key="key" avatar>
                    <v-list-tile-avatar>
                      <img :src="item.thumbnail">
                    </v-list-tile-avatar>
                    <v-list-tile-content>
                      <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                      <v-btn v-if="key !== 0" icon ripple @click="del(item,key)">
                        <v-icon>delete</v-icon>
                      </v-btn>
                    </v-list-tile-action>
                  </v-list-tile>
                </v-list>
              </v-card-text>

              <v-card-text v-else class="text-xs-center">
                <p class="headline">キューに曲がありません</p>
                <p class="subheading">もし曲が再生されているのにキューにない場合はご連絡ください</p>
              </v-card-text>

              <v-divider />

              <v-container>
                <v-slider :disabled="queue.length == 0" v-model="volume" prepend-icon="volume_up" thumb-label @min="0" @max="100" />
              </v-container>

              <v-card-actions>
                <v-spacer />
                <v-tooltip top>
                  <v-btn slot="activator" icon ripple disabled>
                    <v-icon>volume_up</v-icon>
                  </v-btn>
                  <span>一時停止中</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn slot="activator" :disabled="skip_block" icon ripple @click="music_skip()">
                    <v-icon>skip_next</v-icon>
                  </v-btn>
                  <span>曲をスキップ</span>
                </v-tooltip>
                <v-tooltip top>
                  <v-btn slot="activator" icon ripple disabled>
                    <v-icon>power_settings_new</v-icon>
                  </v-btn>
                  <span>実装予定</span>
                </v-tooltip>
              </v-card-actions>

            </v-card>
          </v-flex>

          <v-flex xs12>
            <v-card>

              <v-card-title primary-title>
                <h3 class="headline mb-0"><v-icon large>search</v-icon> Search</h3>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-form @submit.prevent="search()">
                    <v-text-field
                      v-model="search_query"
                      name="search_query"
                      label="検索キーワード"
                    />
                  </v-form>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer />
                <v-btn
                  color="blue-grey"
                  class="white--text"
                  flat
                  @click="clearSearch()"
                >
                  <v-icon>clear</v-icon>
                </v-btn>
                <v-btn
                  :loading="searching"
                  :disabled="searching"
                  color="primary"
                  type="submit"
                  @click="search()"
                >
                  <v-icon>search</v-icon>
                </v-btn>
              </v-card-actions>

              <v-slide-y-transition>
                <v-card-text v-show="search_panel">
                  <v-list v-if="search_result.length > 0" two-line>
                    <v-list-tile v-for="item in search_result" :key="item.id" avatar>
                      <v-list-tile-avatar>
                        <img :src="item.thumbnail">
                      </v-list-tile-avatar>
                      <v-list-tile-content>
                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        <v-list-tile-sub-title v-if="item.channel">by {{ item.channel }}</v-list-tile-sub-title>
                      </v-list-tile-content>
                      <v-list-tile-action>
                        <v-btn :disabled="add_block" icon ripple @click="add(item)">
                          <v-icon>playlist_add</v-icon>
                        </v-btn>
                      </v-list-tile-action>
                    </v-list-tile>
                  </v-list>
                </v-card-text>
              </v-slide-y-transition>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </div>

    <div v-else>
      <v-container>
        <v-alert :value="error" color="error" icon="warning" transition="scale-transition">
          {{ messages[error] }}
        </v-alert>
        <v-alert color="warning" icon="priority_high" value="true" transition="scale-transition">
          チャンネルに接続されていません
        </v-alert>
      </v-container>
    </div>

  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      volume: 0,
      volume_panel: false,
      search_query: '',
      search_result: [],
      search_panel: false,
      queue: [],
      searching: false,
      add_block: false,
      skip_block: false,
      error: null,
      messages: {
        UNAUTHORIZED: 'ログインしてください',
        INVAILD_CHANNEL: 'チャンネルが正しくありません(URLを確認してください)',
        INVAILD_CHANNEL_TYPE: 'ボイスチャンネルではありません(URLを確認してください)',
        CHANNEL_IS_FULL: 'ボイスチャンネルが満員です',
        MISSING_PERMISSION: 'ボイスチャンネルに参加できません(権限を確認してください)',
        USER_NOT_JOINED: 'ボイスチャンネルに参加してください',
        ALREADY_JOINED: 'すでに参加しています',
        UNTREATED_CHANNEL: 'チャンネルが読み込まれていません',
        INVAILD_TYPE: 'タイプが正しくありません',
        UNKNOWN_ERROR: '不明なエラー',
      },
    }
  },
  computed: {
    ...mapState([
      'isConnected',
      'connect_guild',
      'connect_guildid',
      'connect_channel',
    ]),
  },
  watch: {
    volume(volume) {
      const data = {
        volume,
        id: this.connect_guildid,
      }
      this.$socket.emit('volume', data)
    },
  },
  mounted() {
    this.$socket.emit('init', {
      user: this.$auth.user.id,
      channel: this.$route.params.id,
    })
  },
  sockets: {
    connect() {
      /* チャンネル判定があるので廃止 */
    },
    disconnect() {
      this.connect_disconnect()
    },
    ready(data) {
      this.connect_ready(data)
    },
    result(data) {
      this.search_result = data
      this.searching = false
      this.search_panel = true
    },
    list(data) {
      this.queue = data
    },
    volume(volume) {
      this.volume = volume
    },
    err(code) {
      this.error = code || 'UNKNOWN_ERROR'
      setTimeout(() => this.error = null, 5000)
    },
  },
  methods: {
    ...mapMutations([
      'connect_ready',
      'connect_disconnect',
    ]),
    search() {
      this.searching = true
      this.$socket.emit('q', {
        type: 'api',
        q: this.search_query,
      })
    },
    add(item) {
      this.$socket.emit('add', {
        ...item,
        guild: this.connect_guildid,
      })
      this.add_block = true
      setTimeout(() => this.add_block = false, 3000)
    },
    del(item, key) {
      this.$socket.emit('remove', {
        index: key,
        id: this.connect_guildid,
      })
    },
    clearSearch() {
      this.search_panel = false
      this.search_result = []
    },
    music_skip() {
      this.$socket.emit('skip', this.connect_guildid)
      this.skip_block = true
      var self = this
      setTimeout(function() {
        self.skip_block = false
      }, 3000)
    },
  },
  middleware: ['auth'],
}
</script>
