// Components/userBox/userBox.js
var wxCharts = require('../../interface/wxcharts.js');
import * as echarts from '../ec-canvas/echarts';
var app = getApp();

function getOption(xData, data_cur, data_his) {
  var windowWidth = 220;
  try {
    var res = wx.getSystemInfoSync();
    windowWidth = res.windowWidth;
  } catch (e) {
    console.error('getSystemInfoSync failed!');
  }

  windowWidth = windowWidth - 20 * 2 - 10 * 2 - 72
  var option = {
    // title: {
    //   text: '测试下面legend的红色区域不应被裁剪',
    //   left: 'center'
    // },
    color: ["lightblue", "yellow"],
    // legend: {
    //   data: ['A', 'B', 'C'],
    //   top: 50,
    //   left: 'center',
    //   backgroundColor: 'red',
    //   z: 100
    // },
    grid: {
      containLabel: true,
      y: 8,
      y2: 0,
      x: windowWidth * 0.05,
      x2: windowWidth * 0.05
    },
    tooltip: {
      show: true,
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
      // show: false
    },
    yAxis: {
      x: 'center',
      type: 'value',
      // min: 12,
      max: function (value) { return value.max >= 12?value.max:12; },
      splitLine: {
        lineStyle: {
          type: 'dashed'
        }
      }
      // show: false
    },
    series: [{
      name: 'A',
      type: 'line',
      smooth: true,
      data: []
    }, {
      name: 'B',
      type: 'line',
      smooth: true,
      data: []
    }]
  };

  return option;
}
var lineChart = null;
let chartLine;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    static: {
      type: Boolean,
      value: false
    },
    showCharts: {
      type: Boolean,
      value: false
    },
    userInfo: {
      type: Object,
      value: {
        avatarUrl: "/image/akari.jpg",
        userId: "",
        nickName: "游客"
      }
    },
    processedData: {
      type: Object,
      value: {}
    },
    getUserInfo: {
      type: Boolean,
      value: false
    },
    isMe:{
      type:Boolean,
      value:false
    }
  },
  // ready:function(){
  // },
  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function() {
    },
    moved: function() {},
    detached: function() {},
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function() {

    },
    hide: function() {},
    resize: function() {},
  },
  /**
   * 组件的初始数据
   */
  data: {
    // chartLine:null
  }, 

  observers: {
    'processedData': function(processedData) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      let that = this
      let weekCost = 0
      if (!processedData) {
        return
      }
      processedData.map(function(x) {
        weekCost = weekCost + x.totalHours
      })
      let fix = function(num){
        return Number(num.toString().match(/^\d+(?:\.\d{0,1})?/))
      }
      that.setData({
        todayCost:fix(processedData[0].totalHours/60),
        weekCost:fix(weekCost/60)
      })
      // console.log('ob processedData', that.data.ecLine)
      if (that.data.showECharts) {
        let processedData = that.data.processedData
        chartLine.setOption({
          xAxis: {
            data: processedData.map(function (x) {
              return x.weekFlag
            })
          },
          series: [{
            data: processedData.map(function (x) {
              return (x.totalHours - x.assignmentHours) / 60.0
            }),
            format: function (val, name) {
              return (val / 60.0).toFixed(2) + 'h';
            }
          }, {
            data: processedData.map(function (x) {
              return (x.assignmentHours) / 60.0
            }),
            format: function (val, name) {
              return (val / 60.0).toFixed(2) + 'h';
            }
          }]
        });
        // this.charts_onLoad()

        // var xData = [1, 2, 3, 4, 5]; // x轴数据 自己写
        // var option = getOption(xData);
        // that.data.chartLine.setOption(option,true);
      }
    },
    'showCharts': function(showCharts) {
      let that = this
      if (showCharts) {
        that.setData({
          ecLine: {
            // 将 lazyLoad 设为 true 后，需要手动初始化图表
            // lazyLoad:true,
            processedData: that.data.processedData,
            chartLine: this.chartLine,
            onInit: function (canvas, width, height) {
              let that = this
              //初始化echarts元素，绑定到全局变量，方便更改数据
              this.chartLine = echarts.init(canvas, null, {
                width: width,
                height: height
              });
              chartLine = this.chartLine 
              canvas.setChart(this.chartLine);

              //可以先不setOption，等数据加载好后赋值，
              //不过那样没setOption前，echats元素是一片空白，体验不好，所有我先set。
              var option = getOption();
              this.chartLine.setOption(option);
              let processedData = that.processedData
              this.chartLine.setOption({
                xAxis: {
                  data: processedData.map(function (x) {
                    return x.weekFlag
                  })
                },
                series: [{
                  data: processedData.map(function (x) {
                    return (x.totalHours - x.assignmentHours) / 60.0
                  }),
                  format: function (val, name) {
                    return (val / 60.0).toFixed(2) + 'h';
                  }
                }, {
                  data: processedData.map(function (x) {
                    return (x.assignmentHours) / 60.0
                  }),
                  format: function (val, name) {
                    return (val / 60.0).toFixed(2) + 'h';
                  }
                }]
              });
            },
          },
        })
        that.setData({
          showECharts:true
        })
      }else{
        that.setData({
          showECharts:false
        })
      }
    },
    
  },
  ready() {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    tap: function() {
      this.triggerEvent('tapBox');
    },
    
    getUserInfo(e) {
      // console.log(e)
      let userInfo = e.detail.userInfo
      // console.log(userInfo)
      this.triggerEvent('login', userInfo);

    },
    // 折线图charts控制
    touchHandler: function(e) {
      lineChart.scrollStart(e);
    },
    moveHandler: function(e) {
      lineChart.scroll(e);
    },
    touchEndHandler: function(e) {
      lineChart.scrollEnd(e);
      lineChart.showToolTip(e, {
        // background: '#7cb5ec',
        format: function(item, category) {
          return category + ' ' + item.name + ':' + item.data
        }
      });
    },
    createSimulationData: function() {
      var categories = [];
      var data = [];
      for (var i = 0; i < 7; i++) {
        categories.push((i + 1));
        data.push(Math.random() * (20 - 10) + 10);
      }
      return {
        categories: categories,
        data: data
      }
    },
    charts_onLoad: function(e) {
      let that = this
      var windowWidth = 220;
      // that.init()
      return
      try {
        var res = wx.getSystemInfoSync();
        windowWidth = res.windowWidth;
      } catch (e) {
        console.error('getSystemInfoSync failed!');
      }
      windowWidth = windowWidth - 12 * 2 - 10 * 2 - 72
      // console.log(windowWidth-20*2-10*2-72)
      var simulationData = this.createSimulationData();
      var simulationData1 = this.createSimulationData();
      // console.log(simulationData)
      let processedData = that.data.processedData
      lineChart = new wxCharts({
        that,
        canvasId: 'lineCanvas',
        type: 'column',
        legend: false,
        categories: processedData.map(function(x) {
          return x.weekFlag
        }),
        animation: false,
        // background: '#f5f5f5',
        series: [{
          name: '个人任务',
          data: processedData.map(function(x) {
            return (x.totalHours - x.assignmentHours) / 60.0
          }),
          format: function(val, name) {
            return (val / 60.0).toFixed(2) + 'h';
          }
        }, {
          name: '分配任务',
          data: processedData.map(function(x) {
            return (x.assignmentHours) / 60.0
          }),
          format: function(val, name) {
            return (val / 60.0).toFixed(2) + 'h';
          }
        }],
        xAxis: {
          disableGrid: true,
          fontColor: '#cccccc'
        },
        yAxis: {
          title: '已分配时间 (h)',
          format: function(val) {
            return val;
          },
          min: 0,
          max: 16,
          titleFontColor: '#cccccc',
          fontColor: '#cccccc',
          // backgroundColor:'white'

        },
        width: windowWidth,
        height: 100,
        dataLabel: false,
        dataPointShape: true,
        // enableScroll: true,
        extra: {
          lineStyle: 'curve'
        }
      });
    },
    handleCanvarToImg(that) {
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 260,
        height: 180,
        canvasId: 'lineCanvas',
        success: function(res) {
          console.log(res)
          that.setData({
            radarImg: res.tempFilePath
          });
        }
      });
    }
  }
})