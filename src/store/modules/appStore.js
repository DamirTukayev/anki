export default {
  state: {
    isAuthorized: false,
    user: null,
    initRoute: null,
    selectedCards: null,
    userInfo: null,
    selectedDeckId: null
  },
  mutations: {
    setValue (state, keyValue) {
      state[keyValue.key] = keyValue.value
    }
  },
  actions: {
    SET_VALUE ({ commit }, keyValue) {
      commit('setValue', keyValue)
    }
  }
}