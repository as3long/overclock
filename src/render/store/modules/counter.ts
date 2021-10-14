import { Commit } from 'vuex'

const state = {
  main: 0,
}

const mutations = {
  DECREMENT_MAIN_COUNTER(state: { main: number }) {
    state.main--
  },
  INCREMENT_MAIN_COUNTER(state: { main: number }) {
    state.main++
  },
}

const actions = {
  someAsyncTask({ commit }: { commit: Commit }) {
    // do something async
    commit('INCREMENT_MAIN_COUNTER')
  },
}

export default {
  state,
  mutations,
  actions,
}
