
var isReady=false;var onReadyCallbacks=[];
var __uniConfig = {"pages":["pages/user/index","pages/user/login","pages/video/index","pages/main/main","pages/main/user"],"window":{"navigationBarTextStyle":"white","navigationBarBackgroundColor":"#ff7d84","backgroundColor":"rgb(241,241,241)","backgroundColorBottom":"rgb(241,241,241)","backgroundColorTop":"rgb(241,241,241)"},"tabBar":{"color":"#8a8a8a","selectedColor":"#ffb6b9","borderStyle":"black","blurEffect":"light","list":[{"text":"主页","pagePath":"pages/main/main","iconPath":"./static/font/home.png","selectedIconPath":"./static/font/home_selected.png"},{"text":"用户","pagePath":"pages/main/user","iconPath":"./static/font/person.png","selectedIconPath":"./static/font/person_selected.png"}]},"splashscreen":{"alwaysShowBeforeRender":true,"autoclose":false},"appname":"情侣厅","compilerVersion":"2.6.5","entryPagePath":"pages/user/index","networkTimeout":{"request":60000,"connectSocket":60000,"uploadFile":60000,"downloadFile":60000}};
var __uniRoutes = [{"path":"/pages/user/index","meta":{"isQuit":true},"window":{"navigationStyle":"custom","titleNView":{"backgroundColor":"#fae3d9","navigationBarTitleText":" ","navigationBarBackgroundColor":"#fae3d9"}}},{"path":"/pages/user/login","meta":{},"window":{"navigationBarTitleText":"登录"}},{"path":"/pages/video/index","meta":{},"window":{"navigationBarTitleText":"基础项目"}},{"path":"/pages/main/main","meta":{"isQuit":true,"isTabBar":true},"window":{"navigationBarTitleText":"情侣厅"}},{"path":"/pages/main/user","meta":{"isQuit":true,"isTabBar":true},"window":{"navigationBarTitleText":"用户中心"}}];
__uniConfig.onReady=function(callback){if(__uniConfig.ready){callback()}else{onReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"ready",{get:function(){return isReady},set:function(val){isReady=val;if(!isReady){return}const callbacks=onReadyCallbacks.slice(0);onReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
service.register("uni-app-config",{create(a,b,c){if(!__uniConfig.viewport){var d=b.weex.config.env.scale,e=b.weex.config.env.deviceWidth,f=Math.ceil(e/d);Object.assign(__uniConfig,{viewport:f,defaultFontSize:Math.round(f/20)})}return{instance:{__uniConfig:__uniConfig,__uniRoutes:__uniRoutes,window:void 0}}}});
