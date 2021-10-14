import is from 'electron-is'

export default {
  index: {
    attrs: {
      title: 'OverClock',
      width: 700,
      height: 600,
      minWidth: 700,
      minHeight: 600,
      // backgroundColor: '#FFFFFF',
      transparent: !is.windows()
    },
    bindCloseToHide: true,
    url: is.dev() ? 'http://localhost:3344' : require('path').join('file://', __dirname, '../render/index.html')
  }
}
