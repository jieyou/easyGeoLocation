easyGeoLocation
===============

A library that optimizes and encapsulates native HTML5 geolocation JavaScript code. You can easily use it to get geolocation information. It offers get, watch and clear method of location, speed and heading. It also improves performance by means of buffering the callback function queue. 

一个将原始的HTML5的geolocation优化封装成的javascript库函数。你可以轻易的使用它来获取地理位置的相关信息。它提供了位置、速度、方向的get和watch以及对应的clear方法，并通过诸如缓存回调函数队列的形式来优化和提高性能。




简体中文使用文档（v1.0）

综述

提供的方法是静态的，没有构造函数，不需要实例化。为了陈述方便和与原生的方法区别，我们所封装的easyGeoLocation的L为大写。

使用链式调用通常会使编码简便。为此，此类的各个方法都会返回这个类本身，以便支持链式调用。即：可以通过在easyGeoLocation之后使用点号（.）链式访问各方法，如easyGeoLocation.getLocation(callbackFunction).watchHeading(callbackFunction,timeout)。

所有的callbackFunction的第一个参数是一个geoInfo对象，它包含了本次获取的信息。需要注意的是，获取某一类型信息的回调函数的geoInfo是会包含该类信息，有可能包含其它类型的信息。如，getSpeed方法的回调函数的这个参数一定会包含speed信息，有可能会包含heading信息（如果此时也同时获得了heading信息则会包含）。这个对象的结构如下：

{
    
    states:0,1,2,3 //本次结果，0:成功，1:没有权限(即用户禁止);2:无法确定位置;3:确定位置超时

    ,timestamp:130000000	//得到信息时的时间戳，定位失败时为null

    ,location:{ //位置信息，没有对应信息时为null

        accuracy: 1000 //位置信息精确度，单位：米

        ,point:{ //位置信息坐标

            latitude:111.1111111

            ,longitude:111.1111111

        }

    }

    ,speed:123 //速度，单位：米/秒，没有对应信息时为null

    ,heading:90 //前进方向，单位：距正北方向顺时针旋转的弧度，没有对应信息时为null

}


静态方法

setConfig(config:Object)	设置参数，参数的格式与意义与HTML5的geolocation.getCurrentPosition方法和geolocation.watchPosition方法所需的第三个参数的格式相同，具体请参阅：http://dev.w3.org/geo/api/ 。 通常情况下，用户不需要特意设置，保持默认即可。 设置是及时生效的，即在调用该方法设置后，所有新的get方法和正在进行中的watch方法都会按照新参数的设定回调。

getAvailableCode(callbackFunction:Function)	通过配置回调函数的形式，获取浏览器和用户对你的站点的定位请求的支持程度。 回调函数有一个参数(availableCode:Number)，数字对应意义如下： 0:浏览器支持且用户允许； 1:浏览器支持，但由于用户禁止而不可用； 10:浏览器不支持。

getLocation(callbackFunction:Function)	通过配置回调函数的形式，获取当前位置一次。

watchLocation(callbackFunction:Function,timeout:Number)	通过配置回调函数的形式，轮询获取当前位置信息。 第二个参数设置多少毫秒后自动清除轮询，缺省为无限长，即不自动清除轮询。

clearWatchLocation()	停止轮询获取当前位置。

getSpeed(callbackFunction:Function)	通过配置回调函数的形式，获取当前速度一次。 getSpeed只有在获取到了速度信息后才会回调。 与getLocation不同的是，通常获取位置（location）比获取速度（speed）要容易且节省时间，即获取速度通常会相对较慢。

stopGetSpeed()	停止获取当前速度。

watchSpeed(callbackFunction:Function,timeout:Number)	通过配置回调函数的形式，轮询获取当前速度信息。 第二个参数设置多少毫秒后自动清除轮询，缺省为无限长，即不自动清除轮询。

clearWatchSpeed()	停止轮询获取当前速度。

getHeading(callbackFunction:Function)	通过配置回调函数的形式，获取当前前进方向一次。 getHeading只有在获取到了速度信息后才会回调。 与getLocation不同的是，通常获取位置（location）比获取前进方向（heading）要容易且节省时间，即获取前进方向通常会相对较慢。

stopGetHeading()	停止获取当前前进方向。

watchHeading(callbackFunction:Function,timeout:Number)	通过配置回调函数的形式，轮询获取当前前进方向信息。 第二个参数设置多少毫秒后自动清除轮询，缺省为无限长，即不自动清除轮询。

clearWatchHeading()	停止轮询获取当前前进方向。

clearWatch()	停止所有轮询获取的方法，即停止watchLocation、watchSpeed和watchHeading。

clearAll()	停止所有轮询获取的方法、获取速度的方法和获取方向的方法，即停止watchLocation、watchSpeed、watchHeading、getSpeed和getHeading。