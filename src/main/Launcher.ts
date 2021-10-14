import { EventEmitter } from 'events'
import { app } from 'electron'

import ExceptionHandler from './core/ExceptionHandler'
import logger from './core/Logger'
import Application from './Application'
import {
  splitArgv,
} from './utils'

export default class Launcher extends EventEmitter {
  exceptionHandler: ExceptionHandler | undefined
  application: Application | undefined
  constructor () {
    super()

    this.makeSingleInstance(() => {
      this.init()
    })
  }

  makeSingleInstance (callback: { (): void; (): any }) {
    const gotSingleLock = app.requestSingleInstanceLock()

    if (!gotSingleLock) {
      app.quit()
    } else {
      app.on('second-instance', (event, argv, workingDirectory) => {
        this.application.showPage('index')
        if (argv.length > 1) {
          this.handleAppLaunchArgv(argv)
        }
      })

      callback && callback()
    }
  }

  init () {
    this.exceptionHandler = new ExceptionHandler()

    if (process.argv.length > 1) {
      this.handleAppLaunchArgv(process.argv)
    }

    this.handleAppEvents()
  }

  handleAppEvents () {
    this.handelAppReady()
    this.handleAppWillQuit()
  }

  /**
   * handleAppLaunchArgv
   * For Windows, Linux
   * @param {array} argv
   */
  handleAppLaunchArgv (argv: string[]) {
    logger.info('[OverClock] handleAppLaunchArgv:', argv)

    // args: array, extra: map
    const { args, extra } = splitArgv(argv)
    logger.info('[OverClock] split argv args:', args)
    logger.info('[OverClock] split argv extra:', extra)
  }

  handelAppReady () {
    app.on('ready', () => {
      this.application = new Application()

      this.application.start('index')

      this.application.on('ready', () => {
      })
      global.application = this.application;
    })

    app.on('activate', () => {
      if (this.application) {
        logger.info('[OverClock] activate')
        this.application.showPage('index')
      }
    })
  }

  handleAppWillQuit () {
    app.on('will-quit', async () => {
      logger.info('[OverClock] will-quit')
      if (this.application) {
        await this.application.stop()
      }
    })
  }
}
