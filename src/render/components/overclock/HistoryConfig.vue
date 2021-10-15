<template>
  <n-card title="历史配置" :bordered="false" size="huge">
    <n-table>
      <thead>
        <tr>
          <th>pciBusID</th>
          <th>信息</th>
          <th>功耗限制(%)</th>
          <th>核心频率</th>
          <th>显存频率</th>
          <th>风扇转速</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in list" :key="item.pciBusID">
          <td>{{item.pciBusID}}</td>
          <td>{{item.info}}</td>
          <td>{{item.power}}</td>
          <td>{{item.core}}</td>
          <td>{{item.mem}}</td>
          <td>{{item.fan}}</td>
        </tr>
      </tbody>
    </n-table>
  </n-card>
</template>

<script>
export default {
  name: 'overclock-history',
  props: {
    devices: Array
  },
  data() {
    return {
      list: []
    }
  },
  methods: {
    getData(oneCard, pciBusID) {
      const dataStr = localStorage.getItem(`overclock:${oneCard}:${pciBusID}`)
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
    }
  },
  watch: {
    devices(newDevices) {
      const arr = []
      arr.push({
        pciBusID: '--',
        info: '全部',
        ...this.getData(false,'')
      })
      newDevices.forEach((device) => {
        const data = this.getData(true, device.pciBusID)
        if (data) {
          arr.push({
            pciBusID: device.pciBusID,
            info: [device.pciBusID, device.DeviceName , device.memMaker, device.memType].join('|'),
            ...data
          })
        }
      })
      this.list = arr
    }
  }
}
</script>

<style>

</style>
