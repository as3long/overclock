import { resolve, join } from 'path'
import { app } from 'electron'
import is from 'electron-is'

function getBasePath () {
  let result = resolve(app.getAppPath(), '../')

  if (is.dev()) {
    result = join(__dirname, `../../extra/`)
  }

  return result
}

export const __static = join(getBasePath(), 'static')
export const devtools = join(__dirname, '../../vue-devtools')
export default {
    __static,
    devtools,
}
