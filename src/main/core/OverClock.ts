import { app } from 'electron'
import is from 'electron-is'
import { resolve, join } from 'path'
import { existsSync } from 'fs'
import execa from 'execa'
import logger from './Logger'

export default class OverClock {
  constructor() {

  }

  getBasePath () {
    let result = resolve(app.getAppPath(), '..')

    if (is.dev()) {
      result = resolve(__dirname, `../../extra/`)
    }

    return result
  }

// {
//   "DeviceGlobalMemory": 6372589568,
//   "DeviceID": 0,
//   "DeviceName": "NVIDIA P106-100",
//   "HasMonitorConnected": 0,
//   "SMX": 10,
//   "SM_major": 6,
//   "SM_minor": 1,
//   "UUID": "GPU-ed9aea11-733c-5c0d-55aa-6977d82cb44e",
//   "VendorID": 29559,
//   "VendorName": "Colorful",
//   "pciBusID": 9,
//   "pciDeviceId": 470225118,
//   "pciSubSystemId": 305427319
// }

  async getMemInfo(devices:{DeviceGlobalMemory:number, pciBusID: number, UUID: string, DeviceName: string, SMX: number, DeviceID: number}[]) {
    const binPath = this.getBinPath()
    const args = ['-amd', '0', '-log', '0']
    const retObj = {}
    const len = devices.length;
    for (let i = 0; i< len; i += 1) {
      const device = devices[i]
      const {stdout = ''} = await execa(binPath, args.concat(['-maker', device.pciBusID.toString()]))
      const arr = stdout.replaceAll(`"`, '').split(',')
      retObj[device.pciBusID] = {
        memMaker: arr[0],
        memType: arr[1],
      }
    }

    return retObj
  }


  async set({
    devices,
    overclock: {
      pusid,
      power,
      core,
      mem,
      fan,
      oneCard,
    }
  }) {
    const binPath = this.getBinPath()
    // 关闭amd超频
    const args = ['-amd', '0']
    if (oneCard === true) {
      args.push('-core')
      args.push(pusid)
      args.push('0')
      args.push((core * 1000).toString())

      args.push('-mem')
      args.push(pusid)
      args.push('0')
      args.push((mem * 1000).toString())

      args.push('-fan')
      args.push(pusid)
      args.push('0')
      args.push(fan)

      args.push('-power')
      args.push(pusid)
      args.push(power)
    } else {
      devices.forEach(device => {
        args.push('-core')
        args.push(device.pciBusID)
        args.push('0')
        args.push((core * 1000).toString())

        args.push('-mem')
        args.push(device.pciBusID)
        args.push('0')
        args.push((mem * 1000).toString())

        args.push('-fan')
        args.push(device.pciBusID)
        args.push('0')
        args.push(fan)

        args.push('-power')
        args.push(device.pciBusID)
        args.push(power)
      });
    }
    // 检测必须用nbminer
    logger.log('overclock args', args.join(' '))
    const {stdout, stderr} = await execa(binPath, args)
    logger.log('overclock', stdout, stderr)
  }

  getBinPath () {
    const basePath = this.getBasePath()
    const result = join(basePath, `/nvapioc.exe`)
    const binIsExist = existsSync(result)
    if (!binIsExist) {
      logger.error('[OverClock] overclock bin is not exist:', result)
      throw new Error('app.overclock-missing-message')
    }

    return result
  }
}
