/**
 * Welcome to translate to more versions in other languages.
 * Please read the translation guide before starting work.
 * https://github.com/agalwood/Motrix/blob/master/CONTRIBUTING.md#-translation-guide
 *
 * Please keep the locale key in alphabetical order.
 */
 export const availableLanguages = [
  {
    value: 'en-US',
    label: 'English'
  },
  {
    value: 'zh-CN',
    label: '简体中文'
  },
]

function checkLngIsAvailable (locale: string) {
  return availableLanguages.some(lng => lng.value === locale)
}

/**
 * getLanguage
 * @param { String } locale
 * https://www.electronjs.org/docs/api/app#appgetlocale
 *
 * Only these locales need to add a `startsWith` fallback
 * when there are with the same prefix
 *
 * ar, ar-XB
 * de, de-AT, de-CH, de-DE
 * en, en-AU, en-CA, en-GB, en-IN, en-NZ, en-US, en-XA, en-ZA
 * es, es-419, es-AR, es-CL, es-CO, es-CR, es-ES, es-HN, es-MX, es-PE, es-US, es-UY, es-VE
 * fr, fr-CA, fr-CH, fr-FR
 * it, it-CH, it-IT
 * pt, pt-BR, pt-PT
 * zh, zh-CN, zh-HK, zh-TW
 */
export function getLanguage (locale: string = 'en-US') {
  if (checkLngIsAvailable(locale)) {
    return locale
  }

  if (locale.startsWith('en')) {
    return 'en-US'
  }

  if (locale.startsWith('zh')) {
    return 'zh-CN'
  }
}
