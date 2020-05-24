// Components/taskBox/taskBox.js
const scui = require('../scui/sc-ui')
let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: {
      type: Array
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    myId: wx.getStorageSync('_id'),
  },
  observers: {
    'processedData': function (processedData) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      let that = this
      that.setData({
        groupInfo: wx.getStorageSync('groupInfo')
      })
      }
  },
  /**
   * 组件的方法列表
   */
  ready() {
    let that = this
    that.data.dialog = scui.Dialog("#dialog");
    that.setData({
      isLeader: that.data.myId == that.data.groupLeader,
      groupLeader: wx.getStorageSync('groupLeader'),
      groupInfo: wx.getStorageSync('groupInfo')
    })
    if (that.data.isLeader) {
      that.data.addMember = scui.Dialog("#addMember");
    }

  },
  methods: {
    openDialog(e) {
      // console.log(e.currentTarget.dataset.index)
      let that = this
      let index = e.currentTarget.dataset.index
      // let edit = that.data.groupInfo.tasks[that.data.info[index]._id][0] == that.data.myId
      let edit = that.data.info[index].createdBy == that.data.myId
      let join = that.data.groupInfo.tasks[that.data.info[index]._id].indexOf(that.data.myId) == -1
      let exit = !join
      // let addMember = that.data.groupInfo.leader == that.data.myId
      that.setData({
        index,
        edit,
        join,
        exit,
        // addMember
      })
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
        addMemberList: null,
        checked: null
      })
    },
    edit() {

    },
    join() {
      let that = this;
      app.API.joinTask({
        userid: [that.data.myId],
        taskid: that.data.info[that.data.index]._id
      }, function(res) {
        console.log('success join')
        that.data.dialog.toggle(); 
        that.triggerEvent('refresh')
      })
    },
    exit() {
      let that = this;
      app.API.exitTask({
        userid: [that.data.myId],
        taskid: that.data.info[that.data.index]._id
      }, function(res) {
        console.log('success exit')
        that.data.dialog.toggle();
        that.triggerEvent('refresh')
      })
    },
    addMember() {
      let that = this;
      let checked = that.data.groupInfo.userList.map(function(x) {
        return that.data.groupInfo.tasks[that.data.info[that.data.index]._id].indexOf(x._id) >= 0
      })
      console.log(checked)
      that.setData({
        checked
      })
      this.data.addMember.toggle();
      // app.API.joinTask({
      //   userid: [that.data.myId],
      //   taskid: that.data.info[that.data.index]._id
      // }, function (res) {
      //   console.log('addMember')
      // })
    },
    checkboxChange(e) {
      let that = this;
      console.log(e.detail.value)
      that.setData({
        addMemberList: e.detail.value
      })
    },
    confirmAdd() {
      let that = this
      app.API.joinTask({
        userid: that.data.addMemberList,
        taskid: that.data.info[that.data.index]._id
      }, function(res) {
        console.log('addMember')
        wx.showModal({
          title: '提示',
          content: '编辑成功',
          showCancel:false
        })
        that.data.addMember.toggle();
        that.triggerEvent('refresh')
      })
    }
  }
})