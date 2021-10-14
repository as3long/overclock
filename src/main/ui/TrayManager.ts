import { EventEmitter } from 'events'
import { join } from 'path'
import { Tray, Menu, nativeImage } from 'electron'
import { getI18n } from './Locale'
import {
  translateTemplate,
  flattenMenuItems,
  updateStates
} from '../utils/menu'
import { __static } from '../configs/path'
// import logger from '../core/Logger'

let tray: Tray | null = null

export default class TrayManager extends EventEmitter {
  options: { theme: string}
  theme: any
  systemTheme: any
  inverseSystemTheme: string
  menu: Electron.Menu | undefined
  i18n: any
  cache: {}
  status: boolean
  focused: boolean
  template: any
  normalIcon: any
  activeIcon: any
  keymap: any
  items: {} | undefined
  inverseActiveIcon: any
  inverseNormalIcon: any
  constructor (options: { theme: string} = {
    theme: '',
  }) {
    super()

    this.options = options
    this.i18n = getI18n()
    this.cache = {}

    this.status = false
    this.focused = false

    this.init()
  }

  init () {
    this.loadTemplate()

    this.loadImages()

    this.initTray()

    this.setupMenu()

    this.handleEvents()
  }

  loadTemplate () {
    this.template = [
      { "id": "app.show", "command": "application:show", "command-arg": { "page": "index" } },
      { "type": "separator" },
      // { "id": "app.about", "command": "application:about" },
      { "id": "app.quit", "command": "application:quit" }
    ]
  }

  loadImages () {
    this.loadImagesForWindows()
  }

  loadImagesForWindows () {
    this.normalIcon = this.getFromCacheOrCreateImage('overclock-32.png')
    this.activeIcon = this.getFromCacheOrCreateImage('overclock-32.active.png')
  }

  getFromCacheOrCreateImage (key: string) {
    let file = this.getCache(key)
    if (file) {
      return file
    }

    file = nativeImage.createFromPath(join(__static, `./${key}`))
    file.setTemplateImage(false)
    this.setCache(key, file)
    return file
  }

  getCache (key: string) {
    // @ts-ignore
    return this.cache[key]
  }

  setCache (key: string, value: any) {
    // @ts-ignore
    this.cache[key] = value
  }

  buildMenu () {
    const keystrokesByCommand = {}
    for (const item in this.keymap) {
      // @ts-ignore
      keystrokesByCommand[this.keymap[item]] = item
    }

    // Deepclone the menu template to refresh menu
    const template = JSON.parse(JSON.stringify(this.template))
    const tpl = translateTemplate(template, keystrokesByCommand, this.i18n)
    // @ts-ignore
    this.menu = Menu.buildFromTemplate(tpl)
    this.items = flattenMenuItems(this.menu)
  }

  setupMenu () {
    this.buildMenu()

    this.updateContextMenu()
  }

  initTray () {
    const { icon } = this.getIcons()
    tray = new Tray(icon)
    // tray.setPressedImage(inverseIcon)

    tray.setToolTip('OverClock')
  }

  handleEvents () {
    // All OS
    tray?.on('click', this.handleTrayClick)

    // macOS, Windows
    // tray.on('double-click', this.handleTrayDbClick)
    tray?.on('right-click', this.handleTrayRightClick)
    tray?.on('mouse-down', this.handleTrayMouseDown)
    tray?.on('mouse-up', this.handleTrayMouseUp)
  }

  handleTrayClick = () => {
    // global.application.toggle()
  }

  handleTrayDbClick = () => {
    // global.application.show()
  }

  handleTrayRightClick = () => {
    tray?.popUpContextMenu(this.menu)
  }

  handleTrayMouseDown = () => {
    this.focused = true
    this.emit('mouse-down', {
      focused: true,
      theme: this.inverseSystemTheme
    })
    this.renderTray()
  }

  handleTrayMouseUp = () => {
    this.focused = false
    this.emit('mouse-up', {
      focused: false,
      theme: this.theme
    })
    this.renderTray()
  }

  async renderTray () {
    const { icon } = this.getIcons()
    tray?.setImage(icon)
    this.updateContextMenu()
  }

  getIcons () {
    const { focused, status, systemTheme } = this

    const icon = status ? this.activeIcon : this.normalIcon
    return {
      icon
    }
  }

  updateContextMenu () {
    if (this.menu) {
      tray?.setContextMenu(this.menu)
    }
  }

  updateMenuStates (visibleStates: object | null, enabledStates: { [x: number]: any } | null, checkedStates: null) {
    updateStates(this.items, visibleStates, enabledStates, checkedStates)

    this.updateContextMenu()
  }

  updateMenuItemVisibleState (id: any, flag: any) {
    const visibleStates = {
      [id]: flag
    }
    this.updateMenuStates(visibleStates, null, null)
  }

  updateMenuItemEnabledState (id: string, flag: boolean) {
    const enabledStates = {
      [id]: flag
    }
    this.updateMenuStates(null, enabledStates, null)
  }

  handleLocaleChange () {
    this.setupMenu()
  }

  destroy () {
    if (tray) {
      tray.removeListener('click', this.handleTrayClick)
      tray.removeListener('right-click', this.handleTrayRightClick)
      tray.removeListener('mouse-down', this.handleTrayMouseDown)
      tray.removeListener('mouse-up', this.handleTrayMouseUp)
    }

    tray?.destroy()
  }
}
