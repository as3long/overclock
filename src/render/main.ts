import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index';
import store from './store'
import Icon from './components/Icons/Icon.vue'
import naive from 'naive-ui'
import('./commands')

const app = createApp(App)
app.component(Icon.name, Icon)

// app.config.globalProperties.$axios = axios;

// @ts-ignore
app.config.globalProperties.$electron = window.electron;
app.use(naive)
app.use(router)
app.use(store)
app.mount('#app')

