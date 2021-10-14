import { createStore } from 'vuex'

import modules from './modules'

export default createStore({
  modules,
  plugins: [
  ],
  strict: process.env.NODE_ENV !== 'production'
})
