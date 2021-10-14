import { initialize } from '@electron/remote/main'
import is from 'electron-is'
import Launcher from './Launcher'
import { app, session } from 'electron'
import { devtools } from './configs/path'

if (is.dev()) {
  require('electron-debug')({ showDevTools: true })
  app.on('ready', async () => {
    await session.defaultSession.loadExtension(devtools)
  })
}

/**
 * initialize the main-process side of the remote module
 */
initialize()

// 由于9.x版本问题，需要加入该配置关闭跨域问题
app.commandLine.appendSwitch('disable-web-security');
// 跨域cookie
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')
// app.commandLine.appendSwitch('disable-site-isolation-trials')
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

global.launcher = new Launcher()
