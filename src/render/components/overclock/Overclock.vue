<template>
  <n-card class="overclock-card" title="超频设置">
    <n-alert title="警告" type="warning">
      除非你知道你在干什么，否则不建议你这么做。目前只支持N卡，A卡请勿尝试
    </n-alert>
    <n-form
      class="overclock-form"
      :model="overclock"
      :rules="rules"
      ref="overclock"
      label-placement="left"
      :label-width="100"
    >
      <n-input-group>
        <n-form-item class="one-card" label="单卡超频" path="oneCard">
          <n-switch v-model:value="overclock.oneCard" />
        </n-form-item>
        <n-select v-if="overclock.oneCard" :style="{ width: '50%' }" v-model:value="overclock.pusid" :options="options" />
      </n-input-group>
      <n-form-item-row label="功耗限制" path="power">
        <n-input-group>
          <n-input
            :style="{ width: '33%' }"
            v-model:value="overclock.power"
            type="input"
            placeholder="0"
          />
          <n-input-group-label>默认0，范围65到105，功耗百分比</n-input-group-label>
        </n-input-group>
      </n-form-item-row>
      <n-form-item-row label="核心频率" path="core">
        <n-input-group>
          <n-input
            :style="{ width: '33%' }"
            v-model:value="overclock.core"
            type="input"
            placeholder="0"
          />
          <n-input-group-label>默认0，单位M 使用相对值（如-200，300）</n-input-group-label>
        </n-input-group>
      </n-form-item-row>
      <n-form-item-row label="显存频率" path="mem">
        <n-input-group>
          <n-input
            :style="{ width: '33%' }"
            v-model:value="overclock.mem"
            type="input"
            placeholder="0"
          />
          <n-input-group-label>默认0，单位M 使用相对值（如-200，300）</n-input-group-label>
        </n-input-group>
      </n-form-item-row>
      <n-form-item-row label="风扇转速" path="fan">
        <n-input-group>
          <n-input
            :style="{ width: '33%' }"
            v-model:value="overclock.fan"
            type="input"
            placeholder="0"
          />
          <n-input-group-label>默认-1，-1：表示自动转速，大于0风扇将使用固定转速</n-input-group-label>
        </n-input-group>
      </n-form-item-row>
      <!-- <n-button @click="reset">最后一次配置</n-button> -->
      <n-button type="warning" @click="save">保存设置</n-button>
      <n-button-group type="small">
        <n-button round @click="clearConfig">清除历史</n-button>
        <n-button @click="showConfig">显示历史</n-button>
        <n-button @click="oneKey" round>一键恢复历史设置</n-button>
      </n-button-group>
      <n-modal v-model:show="showModal">
        <overclock-history :devices="modalDevices"/>
      </n-modal>
    </n-form>
  </n-card>
</template>

<script>
import { mapState } from 'vuex'
import { useMessage } from 'naive-ui'
import HistoryConfig from './HistoryConfig.vue'

let message;
// 超频设置
export default {
  name: 'loder-overclock',
  components: {
    [HistoryConfig.name]: HistoryConfig
  },
  setup() {
    message = useMessage();
  },
  computed: {
    ...mapState('overclock', {
      devices: state => state.devices || [],
    }),
    options() {
      const arr = []
      this.devices.forEach(device => {
        arr.push({
          label: [device.pciBusID, device.DeviceName , device.memMaker, device.memType].join(' | '),
          value: device.pciBusID
        })
      });
      return arr
    },
  },
  created() {
    this.$electron.ipcRenderer.send('command', 'deviceDetection:get-devices')
    // this.$store.dispatch('overclock/updateDevices', [
    //   {
    //     "DeviceGlobalMemory": 6372589568,
    //     "DeviceID": 0,
    //     "DeviceName": "NVIDIA P106-100",
    //     "HasMonitorConnected": 0,
    //     "SMX": 10,
    //     "SM_major": 6,
    //     "SM_minor": 1,
    //     "UUID": "GPU-ed9aea11-733c-5c0d-55aa-6977d82cb44e",
    //     "VendorID": 29559,
    //     "VendorName": "Colorful",
    //     "pciBusID": 9,
    //     "pciDeviceId": 470225118,
    //     "pciSubSystemId": 305427319,
    //     "memMaker": '三星',
    //     'memType': 'GDDR5'
    //   }
    // ])
  },
  data() {
    return {
      showModal: false,
      modalDevices: [],
      config: '',
      overclock: {
        pusid: '',
        power: '0',
        core: '0',
        mem: '0',
        fan: '-1',
        oneCard: false,
      },
      rules: {
        power: {
          type: 'integer',
          min: 65,
          max: 105
        },
        core: {
          type: 'integer',
        },
        mem: {
          type: 'integer',
        },
        fan: {
          type: 'integer'
        }
      }
    }
  },
  methods: {
    reset() {
      this.overclock.power = '0'
      this.overclock.core = '0'
      this.overclock.mem = '0'
      this.overclock.fan = '-1'
      this.overclock.pusid = ''
      this.overclock.oneCard = false
    },
    readConfig() {
      const dataStr = localStorage.getItem(`overclock:${this.overclock.oneCard}:${this.overclock.pusid}`)
      if (dataStr) {
        const data = JSON.parse(dataStr)
        this.overclock.power = data.power
        this.overclock.core = data.core
        this.overclock.mem = data.mem
        this.overclock.fan = data.fan
      } else {
        this.overclock.power = '0'
        this.overclock.core = '0'
        this.overclock.mem = '0'
        this.overclock.fan = '-1'
      }
    },
    getData(oneCard, pciBusID) {
      const dataStr = localStorage.getItem(`overclock:${oneCard}:${pciBusID}`)
      console.log('getData', oneCard, pciBusID, dataStr)
      let obj = {
        power: 0,
        core: 0,
        mem: 0,
        fan: -1
      }
      if (dataStr) {
        obj = JSON.parse(dataStr)
        return obj
      }
      if (oneCard == false) {
        return obj
      }
      return undefined
    },
    async wait(time = 100) {
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, time)
      })
    },
    async oneKey() {
      let config = this.getData(false,'')
      const obj = {
        devices: this.devices,
        overclock: {
          pusid: '',
          oneCard: false,
          ...config
        }
      }
      electron.ipcRenderer.send('command', 'overclock:set', JSON.parse(JSON.stringify(obj)))
      await this.wait(100)
      const len = this.devices.length;
      for (let index = 0; index < len; index++) {
        const device = this.devices[index];
        config = this.getData(true, device.pciBusID)
        if (config) {
          await this.wait(100)
          obj.overclock = {
            pusid: device.pciBusID,
            oneCard: true,
            ...config
          }
          electron.ipcRenderer.send('command', 'overclock:set', JSON.parse(JSON.stringify(obj)))
        }
      }
      message.success('一键设置成功');
    },
    async save() {
      const obj = {
        devices: this.devices,
        overclock: this.overclock,
      }
      console.log('保存超频', obj)
      electron.ipcRenderer.send('command', 'overclock:set', JSON.parse(JSON.stringify(obj)))
      await this.wait(100)
      if (this.overclock.oneCard == false) {
        localStorage.clear()
        await this.wait(100)
      }
      localStorage.setItem(`overclock:${this.overclock.oneCard}:${this.overclock.pusid}`, JSON.stringify({
        power: this.overclock.power,
        core: this.overclock.core,
        mem: this.overclock.mem,
        fan: this.overclock.fan,
      }))
      this.readConfig()
      message.success('保存成功');
    },
    clearConfig() {
      localStorage.clear()
      this.readConfig()
    },
    showConfig() {
      this.showModal = !this.showModal
      this.modalDevices = []
      setTimeout(() => {
        this.modalDevices = this.devices
      }, 50)
    }
  },
  watch: {
    devices() {
      this.readConfig()
    },
    'overclock.oneCard': function(newVal) {
      if (newVal === false) {
        this.$nextTick(() => {
          this.overclock.pusid = ''
        })
      }
      this.readConfig()
    },
    'overclock.pusid': function() {
      this.readConfig()
    }
  }
}
</script>

<style lang="scss">
.overclock-card {
  margin-top: 35px;
  .overclock-form {
    margin-top: 10px;
    .n-button {
      margin-right: 20px;
    }
    .one-card {
      margin-right: 20px;
    }
  }
}
</style>
