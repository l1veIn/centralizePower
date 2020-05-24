//app.js
const scui = require('./Components/scui/sc-ui')
let API = require('interface/interface.js').API
App({
  onLaunch:function(){
    // wx.cloud.init();
  },
  id:'app',
  API
})