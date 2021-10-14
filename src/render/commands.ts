import router from '@/render/router'
import store from '@/render/store'
import { commands } from '@/render/components/CommandManager/instance'

const showAboutPanel = () => {
  router.push({ path: '/about' }).catch(err => {
    console.log(err)
  })
}

const updateDevices = (devices) => {
  store.dispatch('overclock/updateDevices', devices)
}

commands.register('application:about', showAboutPanel)
commands.register('deviceDetection:update-devices', updateDevices)
