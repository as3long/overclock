import appLocaleEnUS from './en-US'
import appLocaleZhCN from './zh-CN'

// Please keep the locale key in alphabetical order.
/* eslint-disable quote-props */
const resources = {
  'en-US': {
    translation: {
      ...appLocaleEnUS
    }
  },
  'zh-CN': {
    translation: {
      ...appLocaleZhCN
    }
  },
}
/* eslint-enable quote-props */

export default resources
