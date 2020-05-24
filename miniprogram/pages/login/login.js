// miniprogram/pages/login/login.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageIndex: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 获取openid
    let that = this
    // console.log(app.id)
    let sysinfo = wx.getSystemInfoSync()
    console.log(sysinfo)
    that.setData({
      sysinfo
    })
    if (wx.getStorageSync('_id') && wx.getStorageSync('groupid')) {
      wx.redirectTo({
        url: '/pages/index/index',
      })
    } else {
      wx.cloud.callFunction({
        name: "getOpenId",
        complete: data => {
          console.log(data)
          if (data.result.data[0]) {
            wx.setStorageSync('_id', data.result.data[0]._id)
          }
          // 拉取主系统数据
          // return
          // wx.setStorageSync('openId', data.result.openId)
          if (data.result.data.length == 0) {
            that.setData({
              pageIndex: 2,
              // openId: data.result.openId
            })
          } else if (!data.result.data[0].belong) {
            that.setData({
              pageIndex: 3,
              // openId: data.result.openId
            })
          } else {
            wx.setStorageSync('groupid', data.result.data[0].belong)
            wx.redirectTo({
              url: '/pages/index/index',
            })
          }
          // that.setData({
          //   openId: data.result.openId
          // })
        }
      });
    }
  },
  getUserInfo(e) {
    let that = this
    // console.log(e.detail.userInfo)
    wx.showLoading({
      title: '注册中',
    })
    app.API.signIn({
      userInfo: e.detail.userInfo
    }, function(e) {
      wx.hideLoading()
      wx.showToast({
        title: '注册成功',
      })
      that.setData({
        pageIndex: 3
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  login(e) {
    // console.log(e)
    let that = this
    let userInfo = e.detail
    // console.log(userInfo)
    API.login(that.data.openId, function(_id) {
      // console.log('login success')
      wx.setStorageSync('openId', that.data.openId)
      wx.setStorageSync('userInfo', userInfo)
      wx.setStorageSync('_id', _id)
      wx.redirectTo({
        url: '/pages/index/index',
      })
    }, userInfo)
  },

})