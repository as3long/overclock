<template>
  <div v-if="false"></div>
</template>

<script>
  import { commands } from '@/render/components/CommandManager/instance'

  export default {
    name: 'overclock-ipc',
    methods: {
      bindIpcEvents () {
        this.$electron.myapi.on('command', (event, command, ...args) => {
          console.log('测试是否接到消息', command)
          commands.execute(command, ...args)
        })
      },
      unbindIpcEvents () {
        this.$electron.myapi.removeAllListeners('command')
      }
    },
    created () {
      this.bindIpcEvents()
    },
    destroyed () {
      this.unbindIpcEvents()
    }
  }
</script>
