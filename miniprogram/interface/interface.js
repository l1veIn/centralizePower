var app = getApp();
wx.cloud.init();
const db = wx.cloud.database()
const _ = db.command
var API = {
  signIn(config, success) {
    let {
      userInfo
    } = config
    db.collection('User').add({
      data: {
        userInfo
      },
      success: function(res) {
        wx.setStorageSync('_id', res._id)
        success()
      }
    })
  },
  doMsgSecCheck: function (text,success) {
    wx.showLoading({
      title: '检测中...',
    })
    wx.serviceMarket.invokeService({
      service: 'wxee446d7507c68b11',
      api: 'msgSecCheck',
      data: {
        "Action": "TextApproval",
        "Text": text
      },
    }).then(res => {
      // success()
      // console.log(res)
      wx.hideLoading()
      if(res.data.Response.EvilTokens.length==0){
        success()
      }else{
        wx.showModal({
          title: '非法词汇',
          content: res.data.Response.EvilTokens[0].EvilKeywords[0],
          showCancel:false
        })
      } 
    })
  },
  createGroup(config, success) {
    let that = this
    let {
      input
    } = config
    let _id = that.getID()
    that.doMsgSecCheck(input,function(){
      wx.showLoading({
        title: '加载中',
      })
      db.collection('Group').add({
        data: {
          _id,
          groupName: input,
          createTime: Date.now(),
          leader: wx.getStorageSync('_id')
        },
        success: function(res) {
          wx.setStorageSync('groupid', res._id)
          wx.hideLoading()
          that.addToGroup({
            userid: wx.getStorageSync('_id'),
            groupid: res._id
          }, success)
        }
      })
    })
    
  },
  addToGroup(config, success) {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    let {
      userid,
      groupid
    } = config
    db.collection('User').doc(userid).update({
      data: {
        belong: groupid
      },
      success: function() {
        wx.setStorageSync('groupid', groupid)
        wx.hideLoading()
        success()
      }
    })
  },
  getGroupInfo(config, success) {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    let {
      groupid
    } = config
    db.collection('Group').where({
      _id: groupid
    }).get({
      success: function(res) {
        wx.hideLoading()
        success(res)
      }
    })
  },
  getGroupDetailInfo(config, success) {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    let {
      groupid
    } = config
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'getGroupDetailInfo',
      // 传给云函数的参数
      data: {
        groupid
      },
      // 成功回调
      complete: function(res) {
        wx.hideLoading()
        let myId = wx.getStorageSync('_id')
        for(let i in res.result.list[0].userList){
          if(res.result.list[0].userList[i]._id==res.result.list[0].leader){
            res.result.list[0].userList[i].rank = 2
          }else if(res.result.list[0].userList[i]._id==myId){
            res.result.list[0].userList[i].rank = 1
          }else{
            res.result.list[0].userList[i].rank = 0
          }
        }
        res.result.list[0].userList.sort(function(a,b){
          return b.rank - a.rank
        })

        success(res)
        wx.setStorageSync('groupLeader', res.result.list[0].leader)
        wx.setStorageSync('groupInfo', res.result.list[0])
      }
    })
  },
  createTask(config, success) {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    let {
      members,
      ...rest
    } = config
    db.collection('Task').add({
      data: {
        ...rest
      },
      success: function(res) {
        console.log('create success')
        let data={}
        data[`tasks.${res._id}`] = members
        db.collection('Group').doc(rest.groupid).update({
          data,
          success: function() {
            wx.hideLoading()
            success()
          }
        })
      }
    })
  },
  joinTask(config, success) {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    let {
      userid,
      taskid
    } = config
    let data = {}
    data[`tasks.` + taskid] = _.addToSet({
      each: userid
    })
    db.collection('Group').doc(wx.getStorageSync('groupid')).update({
      data,
      success: function() {
        wx.hideLoading()
        success()
      }
    })
  },
  editMember(config, success) {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    let {
      userid,
      taskid
    } = config
    let data = {}
    data[`tasks.` + taskid] = userid
    db.collection('Group').doc(wx.getStorageSync('groupid')).update({
      data,
      success: function() {
        wx.hideLoading()
        success()
      }
    })
  },

  updateNickName(nickName, success) {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    let data = {}
    data['userInfo.nickName'] = nickName
    db.collection('User').doc(wx.getStorageSync('_id')).update({
      data,
      success: function() {
        wx.hideLoading()
        success()
      }
    })
  },
  leaveGroup(success) {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    let data = {}
    data['belong'] = _.remove()
    db.collection('User').doc(wx.getStorageSync('_id')).update({
      data,
      success: function() {
        wx.hideLoading()
        wx.removeStorageSync('groupid')
        wx.removeStorageSync('groupLeader')
        wx.removeStorageSync('groupInfo')
        success()
      }
    })
  },
  exitTask(config, success) {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    let {
      userid,
      taskid
    } = config
    let data = {}
    // tags: _.pullAll(['database', 'cloud'])
    data[`tasks.` + taskid] = _.pullAll(userid)
    db.collection('Group').doc(wx.getStorageSync('groupid')).update({
      data,
      success: function () {
        wx.hideLoading()
        success()
      }
    })
  },
  getID() {
    let codeStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    let base62encode = function(v, n) {
      var ret = ""
      for (var i = 0; i < n; i++) {
        ret = codeStr[v % codeStr.length] + ret
        v = Math.floor(v / codeStr.length)
      }
      return ret
    }
    var ret = ''
    var ms = (new Date()).getTime()
    ret += base62encode(ms, 4) // 6923年循环一次
    ret += base62encode(Math.ceil(Math.random() * (62 ** 6)), 4) // 冲突概率为每毫秒568亿分之一
    return ret
  },
  getTask2Date(tasks, userid, taskList, startDate, endDate) {
    let that = this
    startDate = new Date(startDate)
    endDate = new Date(endDate)
    let days = (endDate - startDate) / (1 * 24 * 60 * 60 * 1000) + 1;
    // console.log(startDate, endDate, days)
    if (days > 100) {
      wx.showModal({
        title: '提示',
        content: '时间跨度太大啦',
      })
      return
    }
    let tmpDate = startDate
    let taskList_obj = {}
    taskList.forEach(item => {
      taskList_obj[item._id] = item
    })
    let result = []
    let myTasks = []
    // tasks.map(function(x) {
    //   if (x.members.indexOf(userid) >= 0) {
    //     myTasks.push(taskList_obj[x.taskid])
    //   }
    // })
    for (let key in tasks) {
      if (tasks[key].indexOf(userid) >= 0) {
        myTasks.push(taskList_obj[key])
      }
    }
    let isTodayTask = function(d, task) {
      let {
        date,
        repeat,
        repeatMode,
        repeatStop
      } = task
      d = new Date((new Date(d)).setHours(0, 0, 0, 0))
      date = new Date((new Date(date)).setHours(0, 0, 0, 0))
      repeatStop = new Date((new Date(repeatStop)).setHours(0, 0, 0, 0))
      if (!repeat) {
        // console.log(d, date, d == date)
        return (d.valueOf() == date.valueOf())
      } else if ((d - repeatStop > 0) || (d - date < 0)) {
        return false
      } else {
        switch (repeatMode) {
          case 'daily':
            return true
            break;
          case 'weekly':
            return (d.getDay() == date.getDay())
            break;
          case 'monthly':
            return (d.getDate() == date.getDate())
            break;
          case 'yearly':
            return ((d.getDate() == date.getDate()) && (d.getMonth() == date.getMonth()))
            break;
          default:
            break;
        }
      }
    }
    // console.log(myTasks)
    while (endDate - tmpDate >= 0) {
      // console.log(tmpDate)
      var weeks = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
      let tmpDate_tasks = []
      let totalHours = 0
      let assignmentHours = 0
      myTasks.map(function(x) {
        if (isTodayTask(tmpDate, x)) {
          tmpDate_tasks.push(x)
          totalHours = totalHours + x.cost
          if (x.assignment) {
            assignmentHours = assignmentHours + x.cost
          }
        }
      })
      result.push({
        date: tmpDate,
        weekFlag: weeks[tmpDate.getDay()],
        totalHours,
        assignmentHours,
        tmpDate_tasks
      })
      tmpDate = new Date(tmpDate.valueOf() + 1 * 24 * 60 * 60 * 1000)
    }
    return result
  }
}

module.exports = {
  API
}