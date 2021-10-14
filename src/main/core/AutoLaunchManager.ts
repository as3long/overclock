import { app } from 'electron'

const LOGIN_SETTING_OPTIONS = {
  args: [
    '--opened-at-login=1'
  ]
}

export default class AutoLaunchManager {
  enable () {
    return new Promise<void>((resolve, reject) => {
      const enabled = app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin
      if (enabled) {
        resolve()
      }

      app.setLoginItemSettings({
        ...LOGIN_SETTING_OPTIONS,
        openAtLogin: true
      })
      resolve()
    })
  }

  disable () {
    return new Promise<void>((resolve, reject) => {
      app.setLoginItemSettings({ openAtLogin: false })
      resolve()
    })
  }

  isEnabled(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const enabled = app.getLoginItemSettings(LOGIN_SETTING_OPTIONS).openAtLogin
      resolve(enabled)
    })
  }
}
