import { app } from 'electron';
import is from 'electron-is';
import Store from 'electron-store';

import {
  getLogPath,
  getSessionPath,
  getUserDownloadsPath,
} from '../utils/index';

export default class ConfigManager {
  userConfig: Store<any> | undefined;
  systemConfig: Store<any> | undefined;
  constructor() {
    this.init();
  }

  init() {
    this.initSystemConfig();
    this.initUserConfig();
  }

  /**
   * Some aria2 conf
   * https://aria2.github.io/manual/en/html/aria2c.html
   *
   * Best bt trackers
   * @see https://github.com/ngosang/trackerslist
   *
   * @see https://github.com/XIU2/TrackersListCollection
   */
  initSystemConfig() {
    this.systemConfig = new Store({
      name: 'system',
      /* eslint-disable quote-props */
      defaults: {
      },
      /* eslint-enable quote-props */
    });
  }

  initUserConfig() {
    this.userConfig = new Store({
      name: 'user',
      // Schema need electron-store upgrade to 3.x.x,
      // but it will cause the application build to fail.
      // schema: {
      //   theme: {
      //     type: 'string',
      //     enum: ['auto', 'light', 'dark']
      //   }
      // },
      /* eslint-disable quote-props */
      defaults: {
        'hide-app-menu': is.windows() || is.linux(),
        locale: app.getLocale(),
        'log-path': getLogPath(),
        'open-at-login': false,
        'session-path': getSessionPath(),
        'window-state': {},
      },
      /* eslint-enable quote-props */
    });
  }

  getSystemConfig():any
  getSystemConfig(key?: string | undefined, defaultValue: any = undefined) {
    if (key === undefined) {
      return this.systemConfig?.store;
    }

    return this.systemConfig?.get(key, defaultValue);
  }

  getUserConfig(): any
  getUserConfig(key: string): any
  getUserConfig(key: string, defaultValue: any): any
  getUserConfig(key?: string | undefined, defaultValue: any = undefined) {
    if (key === undefined) {
      return this.userConfig?.store;
    }

    return this.userConfig?.get(key, defaultValue);
  }

  getLocale(): string {
    return this.getUserConfig('locale') || app.getLocale();
  }

  // @ts-ignore
  setSystemConfig(...args) {
    // @ts-ignore
    this.systemConfig?.set(...args);
  }

  // @ts-ignore
  setUserConfig(...args) {
    // @ts-ignore
    this.userConfig?.set(...args);
  }

  reset() {
    this.systemConfig?.clear();
    this.userConfig?.clear();
  }
}
