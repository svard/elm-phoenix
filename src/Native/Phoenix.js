Elm.Native.Phoenix = {};
Elm.Native.Phoenix.make = function(localRuntime) {
  localRuntime.Native = localRuntime.Native || {};
  localRuntime.Native.Phoenix = localRuntime.Native.Phoenix || {};
  if (localRuntime.Native.Phoenix.values){
    return localRuntime.Native.Phoenix.values;
  }

  var Task = Elm.Native.Task.make (localRuntime);
  var Utils = Elm.Native.Utils.make (localRuntime);
  var socket, chan;

  function newSocket(endPoint, params) {
    params = transport(params);
    return socket || new Phoenix.Socket(endPoint, params);
  }

  function transport(params) {
    if (params.transport.ctor === "WebSocket") {
      params.transport = window.WebSocket;
    } else if (params.transport.ctor === "LongPoll") {
      params.transport = Phoenix.LongPoll;
    } else {
      params.transport = window.WebSocket;
    }

    return params;
  }

  function connect(socket) {
    return Task.asyncFunction(function(callback){
      if (socket.isConnected()) {
        callback(Task.succeed(socket));
      } else {
        attemptConnection(socket, callback);
      }
    });
  }

  function attemptConnection(socket, callback) {
    socket.onOpen(function () {
      callback(Task.succeed(socket));
    });
    socket.connect();
  }

  function channel(topic, socket) {
    return Task.asyncFunction(function(callback){
      chan = chan || socket.channel(topic, {});
      callback(Task.succeed(chan));
    });
  }

  function join(address, channel) {
    return Task.asyncFunction(function(callback){
      if (channel.joinedOnce) {
        callback(Task.succeed(channel));
      } else {
        channel.join()
        .receive("ok", function (payload) {
          if (typeof payload !== "string") {
            payload = JSON.stringify(payload) || "";
          }
          Task.perform(address._0(payload));
          callback(Task.succeed(channel));
        })
        .receive("error", function (resp) {
          callback(Task.fail(resp));
        });
      }
    });
  }

  function push(topic, payload, channel) {
    return Task.asyncFunction(function(callback){
      if (!channel.canPush) {
        return callback(Task.fail("Failed to push message"));
      }
      try {
        channel.push(topic, JSON.parse(payload));
        callback(Task.succeed(Utils.Tuple0));
      }
      catch (e) {
        callback(Task.fail(e.message));
      }
    });
  }

  function on(topic, address, channel) {
    return Task.asyncFunction(function(callback){
      channel.on(topic, function (payload) {
        if (typeof payload !== "string") {
          payload = JSON.stringify(payload) || "";
        }
        Task.perform(address._0(payload));
      });
      callback(Task.succeed(Utils.Tuple0));
    });
  }

  localRuntime.Native.Phoenix.values = {
    socket: F2(newSocket),
    connect: connect,
    channel: F2(channel),
    join: F2(join),
    push: F3(push),
    on: F3(on)
  };
  
  return localRuntime.Native.Phoenix.values;
}

!function(){"use strict";var t="undefined"==typeof window?global:window;if("function"!=typeof t.require){var e={},n={},o={}.hasOwnProperty,i={},r=function(t,e){var n=0;e&&(e.indexOf(!1)&&(n="components/".length),e.indexOf("/",n)>0&&(e=e.substring(n,e.indexOf("/",n))));var o=i[t+"/index.js"]||i[e+"/deps/"+t+"/index.js"];return o?"components/"+o.substring(0,o.length-".js".length):t},s=function(){var t=/^\.\.?(\/|$)/;return function(e,n){var o,i,r=[];o=(t.test(n)?e+"/"+n:n).split("/");for(var s=0,c=o.length;c>s;s++)i=o[s],".."===i?r.pop():"."!==i&&""!==i&&r.push(i);return r.join("/")}}(),c=function(t){return t.split("/").slice(0,-1).join("/")},a=function(e){return function(n){var o=s(c(e),n);return t.require(o,e)}},h=function(t,e){var o={id:t,exports:{}};return n[t]=o,e(o.exports,a(t),o),o.exports},u=function(t,i){var c=s(t,".");if(null==i&&(i="/"),c=r(t,i),o.call(n,c))return n[c].exports;if(o.call(e,c))return h(c,e[c]);var a=s(c,"./index");if(o.call(n,a))return n[a].exports;if(o.call(e,a))return h(a,e[a]);throw new Error('Cannot find module "'+t+'" from "'+i+'"')};u.alias=function(t,e){i[e]=t},u.register=u.define=function(t,n){if("object"==typeof t)for(var i in t)o.call(t,i)&&(e[i]=t[i]);else e[t]=n},u.list=function(){var t=[];for(var n in e)o.call(e,n)&&t.push(n);return t},u.brunch=!0,t.require=u}}(),require.define({phoenix:function(t,e,n){"use strict";function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}t.__esModule=!0;var i="1.0.0",r={connecting:0,open:1,closing:2,closed:3},s={closed:"closed",errored:"errored",joined:"joined",joining:"joining"},c={close:"phx_close",error:"phx_error",join:"phx_join",reply:"phx_reply",leave:"phx_leave"},a={longpoll:"longpoll",websocket:"websocket"},h=function(){function t(e,n,i){o(this,t),this.channel=e,this.event=n,this.payload=i||{},this.receivedResp=null,this.afterHook=null,this.recHooks=[],this.sent=!1}return t.prototype.send=function(){var t=this,e=this.channel.socket.makeRef();this.refEvent=this.channel.replyEventName(e),this.receivedResp=null,this.sent=!1,this.channel.on(this.refEvent,function(e){t.receivedResp=e,t.matchReceive(e),t.cancelRefEvent(),t.cancelAfter()}),this.startAfter(),this.sent=!0,this.channel.socket.push({topic:this.channel.topic,event:this.event,payload:this.payload,ref:e})},t.prototype.receive=function(t,e){return this.receivedResp&&this.receivedResp.status===t&&e(this.receivedResp.response),this.recHooks.push({status:t,callback:e}),this},t.prototype.after=function(t,e){if(this.afterHook)throw"only a single after hook can be applied to a push";var n=null;return this.sent&&(n=setTimeout(e,t)),this.afterHook={ms:t,callback:e,timer:n},this},t.prototype.matchReceive=function(t){var e=t.status,n=t.response;t.ref;this.recHooks.filter(function(t){return t.status===e}).forEach(function(t){return t.callback(n)})},t.prototype.cancelRefEvent=function(){this.channel.off(this.refEvent)},t.prototype.cancelAfter=function(){this.afterHook&&(clearTimeout(this.afterHook.timer),this.afterHook.timer=null)},t.prototype.startAfter=function(){var t=this;if(this.afterHook){var e=function(){t.cancelRefEvent(),t.afterHook.callback()};this.afterHook.timer=setTimeout(e,this.afterHook.ms)}},t}(),u=function(){function t(e,n,i){var r=this;o(this,t),this.state=s.closed,this.topic=e,this.params=n||{},this.socket=i,this.bindings=[],this.joinedOnce=!1,this.joinPush=new h(this,c.join,this.params),this.pushBuffer=[],this.rejoinTimer=new d(function(){return r.rejoinUntilConnected()},this.socket.reconnectAfterMs),this.joinPush.receive("ok",function(){r.state=s.joined,r.rejoinTimer.reset()}),this.onClose(function(){r.socket.log("channel","close "+r.topic),r.state=s.closed,r.socket.remove(r)}),this.onError(function(t){r.socket.log("channel","error "+r.topic,t),r.state=s.errored,r.rejoinTimer.setTimeout()}),this.on(c.reply,function(t,e){r.trigger(r.replyEventName(e),t)})}return t.prototype.rejoinUntilConnected=function(){this.rejoinTimer.setTimeout(),this.socket.isConnected()&&this.rejoin()},t.prototype.join=function(){if(this.joinedOnce)throw"tried to join multiple times. 'join' can only be called a single time per channel instance";return this.joinedOnce=!0,this.sendJoin(),this.joinPush},t.prototype.onClose=function(t){this.on(c.close,t)},t.prototype.onError=function(t){this.on(c.error,function(e){return t(e)})},t.prototype.on=function(t,e){this.bindings.push({event:t,callback:e})},t.prototype.off=function(t){this.bindings=this.bindings.filter(function(e){return e.event!==t})},t.prototype.canPush=function(){return this.socket.isConnected()&&this.state===s.joined},t.prototype.push=function(t,e){if(!this.joinedOnce)throw"tried to push '"+t+"' to '"+this.topic+"' before joining. Use channel.join() before pushing events";var n=new h(this,t,e);return this.canPush()?n.send():this.pushBuffer.push(n),n},t.prototype.leave=function(){var t=this;return this.push(c.leave).receive("ok",function(){t.socket.log("channel","leave "+t.topic),t.trigger(c.close,"leave")})},t.prototype.onMessage=function(t,e,n){},t.prototype.isMember=function(t){return this.topic===t},t.prototype.sendJoin=function(){this.state=s.joining,this.joinPush.send()},t.prototype.rejoin=function(){this.sendJoin(),this.pushBuffer.forEach(function(t){return t.send()}),this.pushBuffer=[]},t.prototype.trigger=function(t,e,n){this.onMessage(t,e,n),this.bindings.filter(function(e){return e.event===t}).map(function(t){return t.callback(e,n)})},t.prototype.replyEventName=function(t){return"chan_reply_"+t},t}();t.Channel=u;var p=function(){function t(e){var n=this,i=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];o(this,t),this.stateChangeCallbacks={open:[],close:[],error:[],message:[]},this.channels=[],this.sendBuffer=[],this.ref=0,this.transport=i.transport||window.WebSocket||l,this.heartbeatIntervalMs=i.heartbeatIntervalMs||3e4,this.reconnectAfterMs=i.reconnectAfterMs||function(t){return[1e3,5e3,1e4][t-1]||1e4},this.logger=i.logger||function(){},this.longpollerTimeout=i.longpollerTimeout||2e4,this.params=i.params||{},this.endPoint=e+"/"+a.websocket,this.reconnectTimer=new d(function(){n.disconnect(function(){return n.connect()})},this.reconnectAfterMs)}return t.prototype.protocol=function(){return location.protocol.match(/^https/)?"wss":"ws"},t.prototype.endPointURL=function(){var t=f.appendParams(f.appendParams(this.endPoint,this.params),{vsn:i});return"/"!==t.charAt(0)?t:"/"===t.charAt(1)?this.protocol()+":"+t:this.protocol()+"://"+location.host+t},t.prototype.disconnect=function(t,e,n){this.conn&&(this.conn.onclose=function(){},e?this.conn.close(e,n||""):this.conn.close(),this.conn=null),t&&t()},t.prototype.connect=function(t){var e=this;t&&(console&&console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor"),this.params=t),this.conn||(this.conn=new this.transport(this.endPointURL()),this.conn.timeout=this.longpollerTimeout,this.conn.onopen=function(){return e.onConnOpen()},this.conn.onerror=function(t){return e.onConnError(t)},this.conn.onmessage=function(t){return e.onConnMessage(t)},this.conn.onclose=function(t){return e.onConnClose(t)})},t.prototype.log=function(t,e,n){this.logger(t,e,n)},t.prototype.onOpen=function(t){this.stateChangeCallbacks.open.push(t)},t.prototype.onClose=function(t){this.stateChangeCallbacks.close.push(t)},t.prototype.onError=function(t){this.stateChangeCallbacks.error.push(t)},t.prototype.onMessage=function(t){this.stateChangeCallbacks.message.push(t)},t.prototype.onConnOpen=function(){var t=this;this.log("transport","connected to "+this.endPointURL(),this.transport.prototype),this.flushSendBuffer(),this.reconnectTimer.reset(),this.conn.skipHeartbeat||(clearInterval(this.heartbeatTimer),this.heartbeatTimer=setInterval(function(){return t.sendHeartbeat()},this.heartbeatIntervalMs)),this.stateChangeCallbacks.open.forEach(function(t){return t()})},t.prototype.onConnClose=function(t){this.log("transport","close",t),this.triggerChanError(),clearInterval(this.heartbeatTimer),this.reconnectTimer.setTimeout(),this.stateChangeCallbacks.close.forEach(function(e){return e(t)})},t.prototype.onConnError=function(t){this.log("transport",t),this.triggerChanError(),this.stateChangeCallbacks.error.forEach(function(e){return e(t)})},t.prototype.triggerChanError=function(){this.channels.forEach(function(t){return t.trigger(c.error)})},t.prototype.connectionState=function(){switch(this.conn&&this.conn.readyState){case r.connecting:return"connecting";case r.open:return"open";case r.closing:return"closing";default:return"closed"}},t.prototype.isConnected=function(){return"open"===this.connectionState()},t.prototype.remove=function(t){this.channels=this.channels.filter(function(e){return!e.isMember(t.topic)})},t.prototype.channel=function e(t){var n=arguments.length<=1||void 0===arguments[1]?{}:arguments[1],e=new u(t,n,this);return this.channels.push(e),e},t.prototype.push=function(t){var e=this,n=t.topic,o=t.event,i=t.payload,r=t.ref,s=function(){return e.conn.send(JSON.stringify(t))};this.log("push",n+" "+o+" ("+r+")",i),this.isConnected()?s():this.sendBuffer.push(s)},t.prototype.makeRef=function(){var t=this.ref+1;return t===this.ref?this.ref=0:this.ref=t,this.ref.toString()},t.prototype.sendHeartbeat=function(){this.push({topic:"phoenix",event:"heartbeat",payload:{},ref:this.makeRef()})},t.prototype.flushSendBuffer=function(){this.isConnected()&&this.sendBuffer.length>0&&(this.sendBuffer.forEach(function(t){return t()}),this.sendBuffer=[])},t.prototype.onConnMessage=function(t){var e=JSON.parse(t.data),n=e.topic,o=e.event,i=e.payload,r=e.ref;this.log("receive",(i.status||"")+" "+n+" "+o+" "+(r&&"("+r+")"||""),i),this.channels.filter(function(t){return t.isMember(n)}).forEach(function(t){return t.trigger(o,i,r)}),this.stateChangeCallbacks.message.forEach(function(t){return t(e)})},t}();t.Socket=p;var l=function(){function t(e){o(this,t),this.endPoint=null,this.token=null,this.skipHeartbeat=!0,this.onopen=function(){},this.onerror=function(){},this.onmessage=function(){},this.onclose=function(){},this.pollEndpoint=this.normalizeEndpoint(e),this.readyState=r.connecting,this.poll()}return t.prototype.normalizeEndpoint=function(t){return t.replace("ws://","http://").replace("wss://","https://").replace(new RegExp("(.*)/"+a.websocket),"$1/"+a.longpoll)},t.prototype.endpointURL=function(){return f.appendParams(this.pollEndpoint,{token:this.token})},t.prototype.closeAndRetry=function(){this.close(),this.readyState=r.connecting},t.prototype.ontimeout=function(){this.onerror("timeout"),this.closeAndRetry()},t.prototype.poll=function(){var t=this;(this.readyState===r.open||this.readyState===r.connecting)&&f.request("GET",this.endpointURL(),"application/json",null,this.timeout,this.ontimeout.bind(this),function(e){if(e){var n=e.status,o=e.token,i=e.messages;t.token=o}else var n=0;switch(n){case 200:i.forEach(function(e){return t.onmessage({data:JSON.stringify(e)})}),t.poll();break;case 204:t.poll();break;case 410:t.readyState=r.open,t.onopen(),t.poll();break;case 0:case 500:t.onerror(),t.closeAndRetry();break;default:throw"unhandled poll status "+n}})},t.prototype.send=function(t){var e=this;f.request("POST",this.endpointURL(),"application/json",t,this.timeout,this.onerror.bind(this,"timeout"),function(t){t&&200===t.status||(e.onerror(status),e.closeAndRetry())})},t.prototype.close=function(t,e){this.readyState=r.closed,this.onclose()},t}();t.LongPoll=l;var f=function(){function t(){o(this,t)}return t.request=function(t,e,n,o,i,r,s){if(window.XDomainRequest){var c=new XDomainRequest;this.xdomainRequest(c,t,e,o,i,r,s)}else{var c=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP");this.xhrRequest(c,t,e,n,o,i,r,s)}},t.xdomainRequest=function(t,e,n,o,i,r,s){var c=this;t.timeout=i,t.open(e,n),t.onload=function(){var e=c.parseJSON(t.responseText);s&&s(e)},r&&(t.ontimeout=r),t.onprogress=function(){},t.send(o)},t.xhrRequest=function(t,e,n,o,i,r,s,c){var a=this;t.timeout=r,t.open(e,n,!0),t.setRequestHeader("Content-Type",o),t.onerror=function(){c&&c(null)},t.onreadystatechange=function(){if(t.readyState===a.states.complete&&c){var e=a.parseJSON(t.responseText);c(e)}},s&&(t.ontimeout=s),t.send(i)},t.parseJSON=function(t){return t&&""!==t?JSON.parse(t):null},t.serialize=function(t,e){var n=[];for(var o in t)if(t.hasOwnProperty(o)){var i=e?e+"["+o+"]":o,r=t[o];"object"==typeof r?n.push(this.serialize(r,i)):n.push(encodeURIComponent(i)+"="+encodeURIComponent(r))}return n.join("&")},t.appendParams=function(t,e){if(0===Object.keys(e).length)return t;var n=t.match(/\?/)?"&":"?";return""+t+n+this.serialize(e)},t}();t.Ajax=f,f.states={complete:4};var d=function(){function t(e,n){o(this,t),this.callback=e,this.timerCalc=n,this.timer=null,this.tries=0}return t.prototype.reset=function(){this.tries=0,clearTimeout(this.timer)},t.prototype.setTimeout=function(t){function e(){return t.apply(this,arguments)}return e.toString=function(){return t.toString()},e}(function(){var t=this;clearTimeout(this.timer),this.timer=setTimeout(function(){t.tries=t.tries+1,t.callback()},this.timerCalc(this.tries+1))}),t}()}}),"object"!=typeof window||window.Phoenix||(window.Phoenix=require("phoenix"));
