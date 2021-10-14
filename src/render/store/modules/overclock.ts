import { Commit } from 'vuex'

const state = {
  devices: [],
}

const mutations = {
  UPDATE_DEVICES(state, devices) {
    state.devices = devices
  },
}

const actions = {
  updateDevices({ commit }: { commit: Commit }, devices) {
    commit('UPDATE_DEVICES', devices)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
