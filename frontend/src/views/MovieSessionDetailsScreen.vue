<template>
  <div v-if="active && !loading" class="session-details">
    <!-- Poster / capa -->
    <div
      class="movie-card"
      :style="{
        backgroundImage:
          movieSession?.movie?.image
            ? `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.8) 100%), url('${absoluteMedia(movieSession.movie.image)}')`
            : 'none'
      }"
    ></div>

    <div class="container">
      <!-- Infos -->
      <div class="info">
        <span>{{ movieSession.movie?.title }}</span>
        <span>Date: {{ formattedDate }}</span>
        <span>Time: {{ formattedTime }}</span>
        <span>Cinema Hall: {{ movieSession.cinema_hall?.name }}</span>
        <span v-if="chosenSeats.length">Selected seats: {{ chosenSeats.length }}</span>
      </div>

      <!-- Mapa de assentos -->
      <cinema-hall-schema
        :takenSeats="movieSession.taken_places"
        :cinemaHall="movieSession.cinema_hall"
        @choose-seat="chooseSeat"
      />

      <!-- Ações -->
      <action-button
        :label="submitting ? 'Processing…' : 'Make order'"
        @click="makeOrder"
        :disabled="submitting || !chosenSeats.length || !user"
      />

      <!-- Mensagens -->
      <p v-if="successText" style="color:#43d17a">{{ successText }}</p>
      <p v-if="errorText" style="color:#ff6b6b">{{ errorText }}</p>
    </div>
  </div>
</template>

<script>
import CinemaHallSchema from '../comps/CinemaHallSchema.vue'
import ActionButton from '../comps/ActionButton.vue'

export default {
  name: 'MovieSessionDetailsScreen',
  props: {
    user: { type: Object, default: null }
  },
  components: { CinemaHallSchema, ActionButton },

  data: () => ({
    active: false,
    loading: false,
    submitting: false,
    movieSession: {},
    chosenSeats: [],
    errorText: '',
    successText: ''
  }),

  computed: {
    token () { return localStorage.getItem('access') },

    // preço unitário e símbolo vindos do .env (com fallback)
    unitPrice () {
      const raw = (import.meta.env && import.meta.env.VITE_TICKET_PRICE) || '20'
      const n = Number(raw)
      return Number.isFinite(n) ? n : 20
    },
    currency () {
      return (import.meta.env && import.meta.env.VITE_CURRENCY_SYMBOL) || 'R$'
    },

    formattedTime () {
      const s = String(this.movieSession?.show_time || '')
      const m = s.match(/T(\d{2}):(\d{2})/)
      return m ? `${m[1]}:${m[2]}` : '—'
    },
    formattedDate () {
      const s = String(this.movieSession?.show_time || '')
      const m = s.match(/(\d{4})-(\d{2})-(\d{2})/)
      return m ? `${m[1]}/${m[2]}/${m[3]}` : '—'
    }
  },

  methods: {
    /* ---------- Helpers ---------- */
    baseUrl () {
      const env = (import.meta.env && import.meta.env.VITE_API_URL) || ''
      const base = env && env.trim() ? env.trim() : 'http://127.0.0.1:8080'
      return new URL('/', base).origin
    },
    buildUrl (path) { return new URL(path, this.baseUrl()).toString() },
    authHeader () { return this.token ? { Authorization: `Bearer ${this.token}` } : {} },
    absoluteMedia (pathOrUrl) {
      try { return new URL(pathOrUrl).toString() } catch { /* relative */ }
      return this.buildUrl(pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`)
    },
    prettyErr (err) {
      const res = err?.response
      if (!res) return err?.message || 'Network error'
      if (res.data && typeof res.data === 'object') {
        const first = Object.values(res.data)[0]
        if (Array.isArray(first)) return first[0]
        if (typeof first === 'string') return first
      }
      return res.data?.detail || res.data?.error || `HTTP ${res.status}`
    },

    /* ---------- Router-like hash ---------- */
    async hashHandler () {
      const match = location.hash.match(/#\/movie-sessions\/(\d+)/)
      if (!match) {
        this.active = false
        this.movieSession = {}
        return
      }
      const [, id] = match
      if (!id) { this.active = false; return }

      this.active = true
      await this.fetchMovieSession(id)
    },

    /* ---------- API ---------- */
    async fetchMovieSession (id) {
      try {
        this.loading = true
        this.errorText = ''
        const url = this.buildUrl(`/api/cinema/movie-sessions/${id}/`)
        const { data } = await this.axios.get(url, { headers: this.authHeader() })
        this.movieSession = data
      } catch (err) {
        this.errorText = this.prettyErr(err)
        console.error('[session details] error:', err)
      } finally {
        this.loading = false
      }
    },

    /* ---------- Seats ---------- */
    chooseSeat (seats) {
      this.chosenSeats = seats
    },

    /* ---------- Order ---------- */
    async makeOrder () {
      if (!this.user || !this.chosenSeats.length || this.submitting) return
      this.submitting = true
      this.errorText = ''
      this.successText = ''

      try {
        const qty = this.chosenSeats.length
        const total = qty * this.unitPrice

        const tickets = this.chosenSeats.map(s => ({
          row: s.row,
          seat: s.seat,
          movie_session: this.movieSession.id
        }))

        const url = this.buildUrl('/api/cinema/orders/')
        await this.axios.post(
          url,
          { tickets },
          { headers: { ...this.authHeader(), 'Content-Type': 'application/json' } }
        )

        // Atualiza a sessão para refletir assentos tomados
        await this.fetchMovieSession(this.movieSession.id)
        this.chosenSeats = []

        // 🔥 Mostra total (qtd × unitário = total)
        this.successText = `Order created successfully! Total: ${this.currency} ${total.toFixed(2)} (${qty} × ${this.currency} ${this.unitPrice.toFixed(2)}). Redirecting to My Orders…`

        setTimeout(() => { location.hash = '#/orders' }, 1200)
      } catch (err) {
        console.error('[order] error:', err?.response?.data || err)
        const msg = this.prettyErr(err)

        if (/unique|already exists|non_field_errors|taken/i.test(JSON.stringify(err?.response?.data || {}))) {
          this.errorText = 'Some of the selected seats were just reserved by another user. The map has been refreshed — please pick different seats.'
          await this.fetchMovieSession(this.movieSession.id)
        } else {
          this.errorText = msg
        }
      } finally {
        this.submitting = false
      }
    }
  },

  mounted () {
    window.addEventListener('hashchange', this.hashHandler)
    this.hashHandler()
  },
  beforeDestroy () {
    window.removeEventListener('hashchange', this.hashHandler)
  }
}
</script>

<style scoped>
.session-details {
  display: grid;
  grid-template-columns: 350px 1fr;
  column-gap: 60px;
}

.movie-card {
  width: 100%;
  height: 470px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info > span:first-of-type {
  font-size: 25px;
  font-weight: 700;
  line-height: 30px;
}

.info > span:not(:first-of-type) {
  font-size: 18px;
  line-height: 22px;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 50px;
}
</style>
