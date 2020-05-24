const scui = require('../scui/sc-ui')
let app = getApp()
Component({
  data: {
    animationData: {}
  },
  properties: {
    top: {
      type: Number,
      value: 600
    },
    title:{
      type:String
    },
  },

  ready: function () {
    let that = this
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    that.animation = animation
    animation.translateY(that.data.top).step()

    that.setData({
      animationData: animation.export()
    })

    // setTimeout(function () {
    //   animation.translate(30).step()
    //   this.setData({
    //     animationData: animation.export()
    //   })
    // }.bind(this), 1000)
  },
  methods: {
    cancel: function () {
      console.log("cancel")
      let that = this
      var animation = wx.createAnimation({
        duration: 500,
        timingFunction: 'ease',
      })
      animation.translateY(-1 * that.data.top).step()
      that.setData({
        animationData: animation.export()
      })
      setTimeout(function () {
        console.log('finish')
        var myEventDetail = {
          result: 'finish'
        }
        that.triggerEvent('finish', myEventDetail)
      }.bind(that), 300)

    },
    submit(e) {
      this.setData({
        value: JSON.stringify(e.detail.value)
      });
      console.log('提交', e.detail.value);
    },
    openDatePicker() {
      this.data.datePicker.open();
    },
    openDialog() {
      // this.data.dialog.toggle();

    },
    closeDialog() {
      this.data.dialog.toggle();
    },
    dialogOpen() {
      console.log("模态框打开中");
    },
    dialogClose() {
      console.log("模态框关闭中");
    },
    dialogOpened() {
      console.log("模态框打开");
    },
    dialogClosed() {
      console.log("模态框关闭");
    },
    radioChange(e) {
      console.log('radio发生change事件，携带value值为：', e.detail.value)
      this.setData({
        radioValue: e.detail.value.toString()
      })
    },
    confirmType(e) {
      let that = this
      that.setData({
        type: that.data.radioValue
      })
      that.data.dialog.toggle();
    },
    input(e){
      let that = this
      console.log(e.detail.value)
      that.setData({
        input: e.detail.value
      })
    },
    build() {
      let that = this
      if(that.data.input){
        app.API.createGroup({
          input: that.data.input
        }, function () {
          wx.showModal({
            title: '提示',
            content: '创建成功',
            showCancel: false,
            success: function (res) {
              wx.redirectTo({
                url: '/pages/index/index',
              })
            }
          })
        })
      }else{
        wx.showModal({
          title: '提示',
          content: '团队名称不能为空',
          showCancel:false
        })
      }
    }
  },
 
})