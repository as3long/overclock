<template>
  <div class="title-bar">
    <div class="title-bar-dragger">
        <mo-icon class="logo" name="logo" width="22" height="22" />
        OverClock
    </div>
    <ul v-if="showActions" class="window-actions">
      <li @click="handleMinimize">
        <mo-icon name="win-minimize" width="12" height="12" />
      </li>
      <li @click="handleMaximize">
        <mo-icon name="win-maximize" width="12" height="12" />
      </li>
      <li @click="handleClose" class="win-close-btn">
        <mo-icon name="win-close" width="12" height="12" />
      </li>
    </ul>
  </div>
</template>

<script>
  import '@/render/components/Icons/win-minimize'
  import '@/render/components/Icons/win-maximize'
  import '@/render/components/Icons/win-close'
  import '@/render/components/Icons/logo'

  export default {
    name: 'overclock-title-bar',
    props: {
      showActions: {
        type: Boolean
      }
    },
    computed: {
      win () {
        return electron.currentWindow
      }
    },
    methods: {
      handleMinimize () {
        this.win.minimize()
      },
      handleMaximize () {
        if (this.win.isMaximized()) {
          this.win.unmaximize()
        } else {
          this.win.maximize()
        }
      },
      handleClose () {
        this.win.close()
      }
    }
  }
</script>

<style lang="scss">
@import "@/render/components/Theme/Variables.scss";

.title-bar {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 36px;
  z-index: 5000;
  background-color: $--titlebar-background;
  color: $--titlebar-color;
  .title-bar-dragger {
    flex: 1;
    user-select: none;
    -webkit-app-region: drag;
    -webkit-user-select: none;
    display: flex;
    align-items: center;
    .logo {
        margin: 0 5px;
    }
  }
  .window-actions {
    opacity: 0.4;
    transition: $--fade-transition;
    list-style: none;
    padding: 0;
    margin: 0;
    z-index: 5100;
    font-size: 0;
    > li {
      display: inline-block;
      padding: 5px 18px;
      font-size: 16px;
      margin: 0;
      color: $--titlebar-actions-color;
      &:hover {
        color: $--titlebar-actions-active-color;
        background-color: $--titlebar-actions-active-background;
      }
      &.win-close-btn:hover {
        color: $--titlebar-close-active-color;
        background-color: $--titlebar-close-active-background;
      }
    }
  }
  &:hover {
    .window-actions {
      opacity: 1;
    }
  }
}
</style>
