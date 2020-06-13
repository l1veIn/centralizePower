// let API = require('../../interface/interface.js').API
var wxCharts = require('../../interface/wxcharts.js'); const scui = require('../../Components/scui/sc-ui')
var lineChart = null;
let app = getApp()
Page({

  data: {
    login: true,
    showBox:false,
    value: '2018-11-11',
    week: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    lastMonth: 'lastMonth',
    nextMonth: 'nextMonth',
    selectVal: '',
    home:false,
    showCharts:false,
    showIndex:-1,
    finishGuide1:wx.getStorageSync('finishGuide1') || false,
    finishGuide2:wx.getStorageSync('finishGuide2') || false
  },
  // onLoad(){
  //   let that = this
  //   that.setData({
  //     userInfo:wx.getStorageSync('userInfo')
  //   })
  // },
  onLoad: function(options) {
    // 获取openid
    let that = this
    // app.API.doMsgSecCheck('法轮功',function(){})
    let sysinfo = wx.getSystemInfoSync()
    let rtbuttonInfo = wx.getMenuButtonBoundingClientRect()
    that.setData({
      sysinfo,
      rtbuttonInfo,
      today:new Date().format('yyyy-MM-dd'),
      myId : wx.getStorageSync('_id')
    })
    that.getGroupInfo()
    // that.data.dialog = scui.Dialog("#dialog");
  },
  
  finishGuide1(){
    let that = this
    that.setData({
      finishGuide1:true
    })
    wx.setStorageSync('finishGuide1', true)
  },
  finishGuide2(){
    let that = this
    that.setData({
      finishGuide2:true
    })
    wx.setStorageSync('finishGuide2', true)
  },
  getGroupInfo() {
    let that = this
    app.API.getGroupDetailInfo({
      groupid: wx.getStorageSync('groupid')
    }, function (res) {
      // console.log(res)

      let { tasks, userList, taskList } = res.result.list[0]
      let processedData = userList.map(function (x) {
        return app.API.getTask2Date(tasks, x._id, taskList, Date.now(), Date.now() + (6 * 24 * 60 * 60 * 1000))
      })
      // console.log(processedData)
      that.setData({
        groupDetailInfo: res.result.list[0],
        processedData
      })
      if(that.data.showIndex>=0){
        that.select({
          detail: that.data.selectVal
        })
      }
    })
  },
  refresh(e){
    let that = this
    that.getGroupInfo()
  },
  showDetail(e){
    let that = this
    let { tasks, userList, taskList } = that.data.groupDetailInfo
    let index = e.currentTarget.dataset.index
    that.setData({
      showIndex: index,
      showCharts:false,
      isMe: userList[index]._id == wx.getStorageSync("_id")
    })
    // let processedDataFromUser = app.API.getTask2Date(tasks, userList[index]._id, taskList, Date.now(), Date.now() + (6 * 24 * 60 * 60 * 1000))
    // that.setData({
    //   processedDataFromUser
    // })
  },
  select(e) {
    // console.log(e)
    // this.charts_onLoad()
    let that = this
    that.setData({
      selectVal: e.detail
    })
    let { tasks, userList, taskList } = that.data.groupDetailInfo
    let processedDataFromUser = app.API.getTask2Date(tasks, userList[that.data.showIndex]._id, taskList,new Date(e.detail),new Date(e.detail).valueOf() + (6 * 24 * 60 * 60 * 1000))
    // console.log(processedDataFromUser[0])
    that.setData({
      processedDataFromUser
    })
  },
  openDialog() {
    
  },
  //
  showCharts(){
    let that = this
    that.setData({
      showCharts: !that.data.showCharts
    })
  },
  backToMain(){
    let that = this
    that.setData({
      showIndex:-1
    })
  },
  showConfigBox() {
    let that = this
    that.setData({
      showBox: !that.data.showBox,
      showCharts:false
    })
    // if (!that.data.showBox){
    //   that.refresh()
    // }
  },
  showEditBox() {
    let that = this
    that.setData({
      showEditBox: !that.data.showEditBox
    })
    // if (!that.data.showBox){
    //   that.refresh()
    // }
  },
  toggleType() {
    this.selectComponent('#Calendar').toggleType();
  },

})