import { parse } from 'querystring'

export function concat (template: any, submenu: any[], submenuToAdd: any[]) {
  submenuToAdd.forEach(sub => {
    let relativeItem = null
    if (sub.position) {
      switch (sub.position) {
      case 'first':
        submenu.unshift(sub)
        break
      case 'last':
        submenu.push(sub)
        break
      case 'before':
        relativeItem = findById(template, sub['relative-id'])
        if (relativeItem) {
          const array = relativeItem.__parent
          const index = array.indexOf(relativeItem)
          array.splice(index, 0, sub)
        }
        break
      case 'after':
        relativeItem = findById(template, sub['relative-id'])
        if (relativeItem) {
          const array = relativeItem.__parent
          const index = array.indexOf(relativeItem)
          array.splice(index + 1, 0, sub)
        }
        break
      default:
        submenu.push(sub)
        break
      }
    } else {
      submenu.push(sub)
    }
  })
}

export function merge (template: any[], item: { id: any; submenu: any[] }) {
  if (item.id) {
    const matched = findById(template, item.id)
    if (matched) {
      if (item.submenu && Array.isArray(item.submenu)) {
        if (!Array.isArray(matched.submenu)) {
          matched.submenu = []
        }
        concat(template, matched.submenu, item.submenu)
      }
    } else {
      concat(template, template, [item])
    }
  } else {
    template.push(item)
  }
}

function findById(template: any[], id: any):any {
  for (const i in template) {
    const item = template[i]
    if (item.id === id) {
      // Returned item need to have a reference to parent Array (.__parent).
      // This is required to handle `position` and `relative-id`
      item.__parent = template
      return item
    } else if (Array.isArray(item.submenu)) {
      const result = findById(item.submenu, id)
      if (result) {
        return result
      }
    }
  }
  return null
}

export function translateTemplate (template: { [x: string]: any }, keystrokesByCommand: {}, i18n: { t: (arg0: any) => any }) {
  for (const i in template) {
    const item = template[i]
    if (item.command) {
      item.accelerator = acceleratorForCommand(item.command, keystrokesByCommand)
    }

    // If label is specified, label is used as the key of i18n.t(key),
    // which mainly solves the inaccurate translation of item.id.
    if (i18n) {
      if (item.label) {
        item.label = i18n.t(item.label)
      } else if (item.id) {
        item.label = i18n.t(item.id)
      }
    }

    item.click = () => {
      handleCommand(item)
    }

    if (item.submenu) {
      translateTemplate(item.submenu, keystrokesByCommand, i18n)
    }
  }
  return template
}

export function handleCommand (item: { [x: string]: any; command: any }) {
  handleCommandBefore(item)

  const args = item['command-arg']
    ? [item.command, item['command-arg']]
    : [item.command]
  // @ts-ignore
  global.application.sendCommandToAll(...args)

  handleCommandAfter(item)
}

function handleCommandBefore (item: { [x: string]: any; command?: any }) {
  if (!item['command-before']) {
    return
  }
  const [command, params] = item['command-before'].split('?')
  const args = parse(params)
  // @ts-ignore
  global.application.sendCommandToAll(command, args)
}

function handleCommandAfter (item: { [x: string]: any; command?: any }) {
  if (!item['command-after']) {
    return
  }
  const [command, params] = item['command-after'].split('?')
  const args = parse(params)
  // @ts-ignore
  global.application.sendCommandToAll(command, args)
}

function acceleratorForCommand (command: string | number, keystrokesByCommand: { [x: string]: any }) {
  const keystroke = keystrokesByCommand[command]
  if (keystroke) {
    let modifiers = keystroke.split(/-(?=.)/)
    const key = modifiers.pop().toUpperCase()
      .replace('+', 'Plus')
      .replace('MINUS', '-')
    modifiers = modifiers.map((modifier: string) => {
      if (process.platform === 'darwin') {
        return modifier.replace(/cmdctrl/ig, 'Cmd')
          .replace(/shift/ig, 'Shift')
          .replace(/cmd/ig, 'Cmd')
          .replace(/ctrl/ig, 'Ctrl')
          .replace(/alt/ig, 'Alt')
      } else {
        return modifier.replace(/cmdctrl/ig, 'Ctrl')
          .replace(/shift/ig, 'Shift')
          .replace(/ctrl/ig, 'Ctrl')
          .replace(/alt/ig, 'Alt')
      }
    })
    const keys = modifiers.concat([key])
    return keys.join('+')
  }
  return null
}

export function flattenMenuItems (menu: Electron.Menu) {
  const flattenItems = {}
  menu.items.forEach(item => {
    if (item.id) {
      // @ts-ignore
      flattenItems[item.id] = item
      if (item.submenu) {
        Object.assign(flattenItems, flattenMenuItems(item.submenu))
      }
    }
  })
  return flattenItems
}

export function updateStates (itemsById: object | undefined, visibleStates: object | null, enabledStates: { [x: number]: any } | null, checkedStates: { [x: string]: any } | null) {
  if (visibleStates) {
    for (const command in visibleStates) {
      // @ts-ignore
      const item = itemsById[command]
      if (item) {
        // @ts-ignore
        item.visible = visibleStates[command]
      }
    }
  }
  if (enabledStates) {
    for (const command in enabledStates) {
      // @ts-ignore
      const item = itemsById[command]
      if (item) {
        item.enabled = enabledStates[command]
      }
    }
  }
  if (checkedStates) {
    for (const id in checkedStates) {
      // @ts-ignore
      const item = itemsById[id]
      if (item) {
        item.checked = checkedStates[id]
      }
    }
  }
}
