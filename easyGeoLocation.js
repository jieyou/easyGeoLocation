/*!
 * easyGeoLocation
 * @author qinjieyou
 * @version	1.0, 2012-06-04
 * @learn more:https://github.com/jieyou/easyGeoLocation
 */

 // * @describtion:A library that optimizes and encapsulates native HTML5 geolocation Javascript code. You can easily use it to get geolocation information. It offers get, watch and clear method of location, speed and heading. It also improves performance by means of buffering the callback function queue.

(function(undefined){
    var availableCode
    ,navGeo = navigator.geolocation
    ,watchPositionQuote = null //当watch方法运行时，它保存navigator.geolocation.watchPosition的引用
    ,watchCallbackCache = {} //保存五种（watchLocationCallback，getSpeedCallback，watchSpeedCallback，getHeadingCallback，watchHeadingCallback）回调函数的对象
    ,option //用户配置项

    // 回调函数的第一个参数的构造函数
    // originalObj -> {Object} HTML5标准的geoLocation成功回调函数的第一个参数的数据格式的对象
    // successOrNot -> {Boolean} 在定位可用的前提下，本次定位是否成功
    // 格式
    /*p = {
        states:null //本次获取的成功与否，0:成功，1:没有权限(即用户禁止，因为已经预先判断，通常不可能出现);2:无法确定位置;3: 确定位置超时
        ,timestamp:null   //得到信息时的时间戳
        ,location:null
          {
            ,accuracy:null
            ,point:{
                x:null
                ,y:null
            }
        }
        ,speed:null
        ,heading:null
    }*/
    ,geoInfo = function(originalObj,isSuccess){
        var p = this;
        if(isSuccess){
            p.states = 0;
            p.timestamp = originalObj.timestamp;
            p.location = {
                accuracy:originalObj.coords.accuracy
                ,point:{
                    latitude:originalObj.coords.latitude
                    ,longitude:originalObj.coords.longitude
                }
            }
            p.speed = originalObj.coords.speed
            p.heading = originalObj.coords.heading
        }else{
            p.states = originalObj.code;
            p.timestamp = p.location = p.speed = p.heading = null;
        }
    }

    // static functions 

    // 定位一次或取得是否用的状态码（getAvailableCode）
    // callbackFunc -> {Function} 回调函数
    // isGetAvailableCode -> {Boolean} 是否是取当前可用状态码availableCode
    ,locationOnce = function(callbackFunc,isGetAvailableCode){
        // 数据不符合规范直接返回，什么也不做，前面是回调函数有问题， 后面是本次不是取availableCode的值，而且定位又不可用
        if((typeof(callbackFunc) !== 'function')||(!isGetAvailableCode && availableCode !== 0 && availableCode !== undefined)){return;}
        // 当本次作用是为了取得availableCode，且其它实例或者先前已经得到了availableCode的值，则直接回调
        if(isGetAvailableCode && availableCode !== undefined){callbackFunc(availableCode);return;}
        if(navGeo){
            navGeo.getCurrentPosition(function(originalObj){
                if(isGetAvailableCode){ // 是取状态码的
                    availableCode = 0;
                    callbackFunc(availableCode);
                }else{
                    callbackFunc(new geoInfo(originalObj,true));
                }
            },function(originalObj){
                if(isGetAvailableCode){
                    if(originalObj.code === 1){ // 用户禁止
                        availableCode = 1;
                    }else{ // 其他错误如2:无法确定位置;3: 确定位置超时，此时认为用户的定位还是可用且用户也允许的
                        availableCode = 0;
                    }
                    callbackFunc(availableCode);
                }else{
                    callbackFunc(new geoInfo(originalObj,false));
                }
            },(isGetAvailableCode?{enableHighAccuracy:false}:option));
        }else{
            if(isGetAvailableCode){
                availableCode = 10;
                callbackFunc(availableCode);
            }
        }
    }

    // 判断某实例还有没有正在进行的watch方法，如果没有了，尝试清除它
    // noCheck -> {Boolean} 是已经不需要判断五个方法都在不在，直接停止
    ,tryClearAll = function(noCheck){
        var l = watchCallbackCache;
        if(noCheck || (l.watchLocationCallback === undefined && l.getSpeedCallback === undefined && l.watchSpeedCallback === undefined && l.getHeadingCallback === undefined && l.watchHeadingCallback === undefined)){
            navGeo.clearWatch(watchPositionQuote);
            watchPositionQuote = null //是否还需要这句？
        }
    }

    // 外部的实例watch相关方法的抽象私有方法（DRY原则）
    // typeOfWatch -> {String} watch的类型
    // callbackFunc -> {Function} 用户配置的回调函数
    // isGetOnce -> {Boolean} 当有一次可用的信息后就停止watch本项目，常用在getSpeed和getHeading中。
    // timeOut -> {Number} 用户是否配置了多少毫秒后自动清除轮询（watch）
    ,watchSth = function(typeOfWatch,callbackFunc,isGetOnce,timeOut){
        // 最开始，如果a（即availableCode）不是0（可用）或undefined（尚未检测），或g（navigator.geolocation）不存在，即立即跳出
        if((availableCode !== 0 && availableCode !== undefined) || !navGeo){return;}
        var callbackFuncQuoteName,clearFuncName
        switch(typeOfWatch){
            case 'location':
                clearFuncName = 'clearWatchLocation';
                callbackFuncQuoteName = 'watchLocationCallback';
                break;
            case 'speed':
                clearFuncName = 'clearWatchSpeed';
                callbackFuncQuoteName = isGetOnce?'getSpeedCallback':'watchSpeedCallback';
                break;
            case 'heading':
                clearFuncName = 'clearWatchHeading';
                callbackFuncQuoteName = isGetOnce?'getHeadingCallback':'watchHeadingCallback';
                break;
            default:
                return;
                break;
        }
        watchCallbackCache[callbackFuncQuoteName] = isGetOnce?(function(originalObj){
            if(originalObj.states === 0 && (typeOfWatch === 'location'?(originalObj[typeOfWatch].point.latitude&&originalObj[typeOfWatch].point.longitude):originalObj[typeOfWatch])){
                callbackFunc(originalObj);
                delete watchCallbackCache[callbackFuncQuoteName];
                tryClearAll();
            }
        }):(function(originalObj){
            if(originalObj.states === 0 && (typeOfWatch === 'location'?(originalObj[typeOfWatch].point.latitude&&originalObj[typeOfWatch].point.longitude):originalObj[typeOfWatch])){
                callbackFunc(originalObj);
            }
        })
        startWatch();
        if(typeof(timeOut) === 'number'){
            setTimeout(function(){
                returns[clearFuncName]();
            },timeOut);
        }
    }

    ,startWatch = function(){
        if(!watchPositionQuote){
            watchPositionQuote = navGeo.watchPosition(function(originalObj){
                    var result = new geoInfo(originalObj,true),thisCallback
                    for(thisCallback in watchCallbackCache){
                        watchCallbackCache[thisCallback](result);
                    }
                },function(originalObj){
                    var result = new geoInfo(originalObj,false),thisCallback
                    for(thisCallback in watchCallbackCache){
                        watchCallbackCache[thisCallback](result);
                    }
                },option);
        }
    }

    // 以下是所有外部方法
    ,returns = {
        // 设置配置项
        // $config {Object} 参数配置项
        setConfig:function($config){
            config = $config;
            if(watchPositionQuote){ // 目前有进行中的watch方法，先停止方法后用新的配置项来重新初始化
                tryClearAll(true);
                startWatch();
            }
        }

        // 回调获取可用状态码
        // callbackFunc -> {Function} 回调函数
        // 回调函数参数
        // 0:浏览器支持且用户允许
        // 1:浏览器支持，但由于用户禁止而不可用
        // 注：原生对象的错误分为三种，1:没有权限(即用户禁止);2:无法确定位置;3: 确定位置超时，只有1时归为此类，2与3都归为0类，浏览器支持且用户允许
        // 10:浏览器不支持
        ,getAvailableCode:function(callbackFunc){
            if(typeof(callbackFunc) === 'function'){
                locationOnce(callbackFunc,true);
            }
            return returns;
        }

        // 回调获取当前位置一次
        // callbackFunc -> {Function} 回调函数
        ,getLocation:function(callbackFunc){
            if(typeof(callbackFunc) === 'function' && navGeo){
                locationOnce(callbackFunc,false);
            }
            return returns;
        }

        // 回调轮询获取当前位置
        // callbackFunc -> {Function} 回调函数
        // timeOut -> {Number} 用户是否配置了多少毫秒后自动清除轮询（watch）
        ,watchLocation:function(callbackFunc,timeOut){
            if(typeof(callbackFunc) === 'function' && navGeo){
                watchSth('location',callbackFunc,false,timeOut);
            }
            return returns;
        }

        // 停止轮询获取当前位置
        ,clearWatchLocation:function(){
            if(navGeo){
                delete watchCallbackCache.watchLocationCallback;
                tryClearAll();
            }
            return returns;
        }

        // 获取当前速度，有速度信息时才会返回
        // callbackFunc -> {Function} 回调函数
        ,getSpeed:function(callbackFunc){
            if(typeof(callbackFunc) === 'function' && navGeo){
                watchSth('speed',callbackFunc,true);
            }
            return returns;
        }

        // 停止获取当前速度
        ,stopGetSpeed:function(){
            if(navGeo){
                delete watchCallbackCache.getSpeedCallback;
                tryClearAll();
            }
            return this;
        }

        // 回调轮询获取当前速度
        // callbackFunc -> {Function} 回调函数
        // timeOut -> {Number} 用户是否配置了多少毫秒后自动清除轮询（watch）
        ,watchSpeed:function(callbackFunc,timeOut){
            if(typeof(callbackFunc) === 'function' && navGeo){
                watchSth('speed',callbackFunc,false,timeOut);
            }
            return returns;
        }

        // 停止轮询获取当前位置
        ,clearWatchSpeed:function(){
            if(navGeo){
                delete watchCallbackCache.watchSpeedCallback;
                tryClearAll();
            }
            return returns;
        }

        // 获取当前前进方向，有前进方向信息时才会返回
        // callbackFunc -> {Function} 回调函数
        ,getHeading:function(callbackFunc){
            if(typeof(callbackFunc) === 'function' && navGeo){
                watchSth('heading',callbackFunc,true);
            }
            return returns;
        }

        // 停止获取当前前进方向
        ,stopGetHeading:function(){
            if(navGeo){
                delete watchCallbackCache.getHeadingCallback;
                tryClearAll();
            }
            return this;
        }

        // 回调轮询获取当前速度
        // callbackFunc -> {Function} 回调函数
        // timeOut -> {Number} 用户是否配置了多少毫秒后自动清除轮询（watch）
        ,watchHeading:function(callbackFunc,timeOut){
            if(typeof(callbackFunc) === 'function' && navGeo){
                watchSth('heading',callbackFunc,false,timeOut);
            }
            return returns;
        }

        // 停止轮询获取当前位置
        ,clearWatchHeading:function(){
            if(navGeo){
                delete watchCallbackCache.watchHeadingCallback;
                tryClearAll();
            }
            return returns;
        }

        // 清除所有watch开头的方法的轮询
        ,clearWatch:function(){
            if(navGeo && watchPositionQuote){
                delete watchCallbackCache.watchSpeedCallback;
                delete watchCallbackCache.watchHeadingCallback;
                delete watchCallbackCache.watchLocationCallback;
                tryClearAll();
            }
            return returns;
        }

        // 清除所有轮询，包括watch开头的方法的轮询和
        ,clearAll:function(){
            if(navGeo && watchPositionQuote){
                delete watchCallbackCache.watchSpeedCallback;
                delete watchCallbackCache.watchHeadingCallback;
                delete watchCallbackCache.watchLocationCallback;
                delete watchCallbackCache.getSpeedCallback;
                delete watchCallbackCache.getHeadingCallback;
                tryClearAll(true);
            }
            return returns;
        }
    }
    window.easyGeoLocation = returns
})();