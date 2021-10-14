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
      <n-input-group>
        <n-form-item class="one-card" label="单卡超频" path="oneCard">
          <n-switch v-model:value="overclock.oneCard" />
        </n-form-item>

        <n-select v-if="overclock.oneCard" :style="{ width: '50%' }" v-model:value="overclock.pusid" :options="options" />
      </n-input-group>
      <n-button @click="reset">重置参数</n-button>
      <n-button type="warning" @click="save">保存设置</n-button>
    </n-form>
  </n-card>
</template>

<script>
import { mapState } from 'vuex'
import { useMessage } from 'naive-ui'

let message;
// 超频设置
export default {
  name: 'loder-overclock',
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
  },
  data() {
    return {
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
    save() {
      const obj = {
        devices: this.devices,
        overclock: this.overclock,
      }
      console.log('保存超频', obj)
      electron.ipcRenderer.send('command', 'overclock:set', JSON.parse(JSON.stringify(obj)))
      message.success('保存成功');
    }
  }
}
</script>

<style lang="scss">
.overclock-card {
  margin-top: 35px;
  .overclock-form {
    margin-top: 20px;
    .n-button {
      margin-right: 20px;
    }
    .one-card {
      margin-right: 20px;
    }
  }
}
</style>
