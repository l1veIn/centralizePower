const scui = require('../scui/sc-ui')
let app = getApp()
Date.prototype.format = function(fmt) {
  var o = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    "S": this.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
  }
  return fmt;
}
Component({
  data: {
    animationData: {},
    timeMode: false,
    repeat: false,
    repeatMode: 'daily',
    isLeader: wx.getStorageSync('_id') == wx.getStorageSync('groupLeader'),
    groupInfo: wx.getStorageSync('groupInfo'),
    addMemberList:[],
    assignment:false
  },
  properties: {
    top: {
      type: Number,
      value: 600
    }
  },

  ready: function() {
    let that = this
    var animation = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease',
    })
    that.animation = animation
    that.data.datePicker = scui.DatePicker("#datepicker");
    that.data.timePicker = scui.TimePicker("#timepicker");
    that.data.dialog = scui.Dialog("#dialog");
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
    cancel: function() {
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
      setTimeout(function() {
        console.log('finish')
        var myEventDetail = {
          result: 'finish'
        }
        that.triggerEvent('finish', myEventDetail)
      }.bind(that), 300)

    },
    submit(e) {
      let that = this
      let ps = e.detail.value.ps
      let { taskName, taskDate, taskStartTime, taskEndTime, repeat, repeatMode, repeatEndDate, addMemberList, assignment} = that.data
      if (addMemberList && addMemberList.length>0){
        console.log(addMemberList)
      }else{
        addMemberList = [wx.getStorageSync('_id')]
      }
      let tmp1 = new Date('2020 ' + taskStartTime)
      let tmp2 = new Date('2020 ' + taskEndTime)
      let tmp3 = new Date('2020 ' + repeatEndDate)
      let cost = (tmp2 - tmp1)/(1000*60)
      if (cost<0){
        wx.showModal({
          title: '提示',
          content: '结束时间小于开始时间，请检查',
          showCancel:false
        })
        return
      }
      if (repeat&&(tmp3 - tmp1<0)){
        wx.showModal({
          title: '提示',
          content: '重复结束时间小于开始时间，请检查',
          showCancel: false
        })
        return
      }
      if (taskName && taskDate && taskStartTime && taskEndTime && (Boolean(repeat) == Boolean(repeatEndDate))){
        console.log('submiting')
        app.API.createTask({
          createdBy:wx.getStorageSync('_id'),
          date: taskDate,
          taskname: taskName,
          groupLeader:wx.getStorageSync('groupLeader'),
          repeat,
          repeatMode,
          repeatStop: repeatEndDate,
          groupid:wx.getStorageSync('groupid'),
          taskStartTime,
          taskEndTime,
          members: addMemberList,
          cost,
          ps,
          assignment
        },function(res){
          that.cancel()
        })
      }else{
        wx.showModal({
          title: '提示',
          content: '信息不全',
        })
      }
    },
    choseTaskDate() {
      this.setData({
        dateTo: 'taskDate'
      })
      this.openDatePicker()
    },
    choseRepeatEndDate() {
      this.setData({
        dateTo: 'repeatEndDate'
      })
      this.openDatePicker()
    },
    openDatePicker() {
      this.data.datePicker.open();
    },
    openTimePicker() {
      this.data.timePicker.open();
    },
    datePickerSubmit(e) {
      let that = this
      // console.log(e.detail.value.format("yyyy-MM-dd") + ' '+e.detail.value.toString().slice(0,3)+'.')
      let tmp = {}
      tmp[that.data.dateTo] = e.detail.value.toString()
      tmp[that.data.dateTo + 'Show'] = e.detail.value.format("yyyy-MM-dd") + ' ' + e.detail.value.toString().slice(0, 3) + '.'
      that.setData(tmp)
    },
    choseTaskStartTime(){
      this.setData({
        timeTo: 'taskStartTime'
      })
      this.openTimePicker()
    },
    choseTaskEndTime() {
      this.setData({
        timeTo: 'taskEndTime'
      })
      this.openTimePicker()
    },
    timePickerSubmit(e) {
      let that = this
      console.log(e)
      let tmp = {}
      tmp[that.data.timeTo] = e.detail.value.format("hh:mm")
      that.setData(tmp)
    },
    addTask(e) {
      let that = this
      console.log(e)
    },
    repeatModeChange(e) {
      let that = this
      console.log(e)
      that.setData({
        repeatMode: e.detail.value
      })
    },
    repeatChange(e) {
      let that = this
      that.setData({
        repeat: e.detail.value,
        repeatEndDate: null,
        repeatEndDateShow: null
      })
    },
    assignmentChange(e) {
      let that = this
      that.setData({
        assignment: e.detail.value
      })
    },
    pickerOpen() {
      console.log("选择器打开中");
    },
    pickerClose() {
      console.log("选择器关闭中");
    },
    pickerOpened() {
      console.log("选择器打开");
    },
    pickerClosed() {
      console.log("选择器关闭");
    },
    inputTaskName() {
      let that = this;
      that.setData({
        inDialog: 'taskName'
      })
      this.openDialog()
    },
    addMember() {
      let that = this;
      that.setData({
        inDialog: 'addMember'
      })
      let checked = that.data.groupInfo.userList.map(function (x) {
        return that.data.addMemberList.indexOf(x._id) >= 0
      })
      console.log(checked)
      that.setData({
        checked
      })
      this.openDialog()
    },
    checkboxChange(e) {
      let that = this;
      console.log(e.detail.value)
      let addMemberList = e.detail.value.map(function (x) {
        return x._id
      })
      let userNameList = e.detail.value.map(function (x) {
        return x.userInfo.nickName
      })
      that.setData({
        addMemberList,
        userNameList
      })
    },
    showTaskName(e) {
      let that = this
      console.log(e.detail.value)
      that.setData({
        taskName: e.detail.value
      })
    },
    choseRepeatMode() {
      let that = this;
      that.setData({
        inDialog: 'repeatMode'
      })
      this.openDialog()
    },
    openDialog() {
      this.data.dialog.toggle();
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
      this.setData({
        inDialog: null
      })
    },
    radioChange(e) {
      console.log('radio发生change事件，携带value值为：', e.detail.value)
      this.setData({
        radioValue: e.detail.value.toString()
      })
    },
    confirmType(e) {
      let that = this
      that.data.dialog.toggle();
    }
  }
})