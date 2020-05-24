// Components/choseFuc/choseFuc.js
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    build() {
      let that = this
      that.setData({
        showBox: true
      })
    },
    join() {
      let that = this
      that.setData({
        showAdd: true
      })
    },
    finish() {
      let that = this
      that.setData({
        showBox: false,
        showAdd: false
      })
    }
  }
})
