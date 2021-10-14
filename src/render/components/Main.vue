<template>
  <main>
      <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
        <n-message-provider>
          <router-view></router-view>
        </n-message-provider>
      </n-config-provider>
  </main>
</template>

<script>
import {
  zhCN,
  dateZhCN,
} from 'naive-ui';
export default {
  name: 'overclock-main',
  data() {
    return {
      zhCN,
      dateZhCN,
    }
  }
}
</script>

<style>

</style>
