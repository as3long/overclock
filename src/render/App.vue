<template>
  <div id="app">
    <overclock-title-bar :showActions="true"></overclock-title-bar>
    <overclock-ipc />
    <overclock-main />
  </div>
</template>

<script>
  import TitleBar from '@/render/components/native/TitleBar.vue'
  import Ipc from '@/render/components/native/Ipc.vue'
  import Main from '@/render/components/Main.vue'
  export default {
    name: 'overclock-app',
    components: {
      [TitleBar.name]: TitleBar,
      [Ipc.name]: Ipc,
      [Main.name]: Main,
    },
    created() {
      // console.log(this)
      // this.$store.dispatch('gate/startUpdate', 'eth')
    }
  }
</script>

<style>
  /* CSS */
</style>
