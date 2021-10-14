const i18next = require('i18next');
import { getLanguage } from './index';

export default class LocaleManager {
  options: object | undefined;
  constructor(options = {}) {
    this.options = options;

    console.log(i18next);
    i18next.init({
      fallbackLng: 'en-US',
      // @ts-ignore
      resources: options.resources,
    });
  }

  changeLanguage(lng: string | undefined) {
    return i18next.changeLanguage(lng);
  }

  changeLanguageByLocale(locale: string | undefined) {
    const lng = getLanguage(locale);
    return this.changeLanguage(lng);
  }

  getI18n() {
    return i18next;
  }
}
