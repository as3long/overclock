import { app } from 'electron'
import is from 'electron-is'
import { resolve, join } from 'path'
import { existsSync } from 'fs'
import execa from 'execa'
import logger from './Logger'

export default class DeviceDetection {
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

  async getCUDA(): Promise<{
    CudaDevices: {DeviceGlobalMemory:number, pciBusID: number, UUID: string, DeviceName: string, SMX: number, DeviceID: number, memMaker: string, memType: string}[],
    DriverVersion: string,
    ErrorString: string,
    NvmlInitialized: number,
    NvmlLoaded: number,
  }> {
    const binPath = this.getBinPath()
    const args = ['-cuda']
    const {stdout = ''} = await execa(binPath, args)

    return JSON.parse(stdout)
  }

// {
//   "AMD": false,
//   "Intel": true,
//   "IsZen": false,
//   "L3KB_size": 0,
//   "Name": "      Intel(R) Celeron(R) CPU  J1800  @ 2.41GHz",
//   "PhysicalProcessorCount": 1,
//   "SupportsAES_SSE42": false,
//   "SupportsAVX": false,
//   "SupportsAVX2": false,
//   "SupportsSSE2": true,
//   "Vendor": "GenuineIntel"
// }
  async getCPU(): Promise<{
    AMD: boolean,
    Intel: boolean,
    IsZen: boolean,
    L3KB_size: number,
    Name: string,
    PhysicalProcessorCount: number,
    SupportsAES_SSE42: boolean,
    SupportsAVX: boolean,
    SupportsAVX2: boolean,
    SupportsSSE2: boolean,
    Vendor: string
  }> {
    const binPath = this.getBinPath()
    const args = ['-cpu']
    const {stdout = ''} = await execa(binPath, args)

    return JSON.parse(stdout)
  }

  getBinPath () {
    const basePath = this.getBasePath()
    const result = join(basePath, `/device_detection/device_detection.exe`)
    const binIsExist = existsSync(result)
    if (!binIsExist) {
      logger.error('[DeviceDetection] DeviceDetection bin is not exist:', result)
      throw new Error('app.DeviceDetection-missing-message')
    }

    return result
  }
}
