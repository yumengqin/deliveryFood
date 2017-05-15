import numeral from 'numeral'; // See at: http://numeraljs.com/
import moment from 'moment'; // See at http://momentjs.com/

/**
 * 小数转换百分比
 * @param  {[Number]} value [0.99111]
 * @return {[type]}       [99.11%]
 */
export function toPercent(value, withSign = true) {
  if (withSign) {
    return numeral(value).format('0.00%');
  }
  return numeral(value).format('0.[000]%');
}

/**
 * 小数转字符串
 * @param  {[Number]} value [10000.1234]
 * @return {[type]}       [10,000.123]
 */
export function toDecimal(value, withSign = true) {
  if (withSign) {
    return numeral(value).format('0,0.00');
  }
  return numeral(value).format('0,0.00');
}

export function toString(value) {
  return numeral(value).format('0');
}
/**
 * 时间戳转日期
 * @method toDate
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
export function toDate(value) {
  return moment(value).format('YYYY-MM-DD');
}

export function toMonth(value) {
  return moment(value).format('YY/MM/DD');
}

/**
 * 时间戳转时间
 * @method toDate
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
export function toTime(value) {
  return moment(value).format('YYYY-MM-DD HH:mm:ss');
}

export function toMinute(value) {
  return moment(value).format('HH:mm');
}
/**
 * 对象转时间范围
 * @method toDate
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
export function toDateRange(startDate, endDate) {
  return [
    startDate && moment(startDate, 'YYYY-MM-DD').format('MM/DD/YYYY'),
    endDate && moment(endDate, 'YYYY-MM-DD').format('MM/DD/YYYY'),
  ].join(' - ');
}

export function getDistance(arr1, arr2) {
  if (arr1 && arr2) {
    var lnglat = new AMap.LngLat(arr1[0], arr1[1]);
    console.log(lnglat.distance(arr2));
    if (lnglat.distance(arr2) / 1000 > 120) {
      return '';
    }
    if (lnglat.distance(arr2) / 1000 < 60) { // 60km/h
      return parseInt(lnglat.distance(arr2) / 1000) + 20 + '分钟';
    } else {
      return parseInt(lnglat.distance(arr2) / 1000 / 60) + '时' + (lnglat.distance(arr2) / 1000) % 60 + '分钟';
    }
  }
  return 0;
}

export function getPosition(app) {
  var map, geolocation;
  //加载地图，调用浏览器定位服务
  map = new AMap.Map('container', {
     resizeEnable: true
  });
  map.plugin('AMap.Geolocation', function() {
     geolocation = new AMap.Geolocation({
         enableHighAccuracy: true,//是否使用高精度定位，默认:true
         timeout: 10000,          //超过10秒后停止定位，默认：无穷大
         buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
         zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
         buttonPosition:'RB'
     });
     map.addControl(geolocation);
     geolocation.getCurrentPosition();
     AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
     AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
  });
  //解析定位结果
  function onComplete(data) {
    console.log('经度：' + data.position.getLng(), '纬度：' + data.position.getLat());
     app.setState({ adress: data.formattedAddress, latAndLon: [data.position.getLng(), data.position.getLat()] });
     localStorage.setItem('adress', JSON.stringify({ adress: data.formattedAddress, latAndLon: [data.position.getLng(), data.position.getLat()] }));
  }
  //解析定位错误信息
  function onError(data) {
      alert('定位失败')
     console.log(data);
  }
}

export function getLatAndLon(str, app, callback) {
  var map = new AMap.Map("container", {resizeEnable: true});
  var resultStr = [];
  var geocoder;
  AMap.service('AMap.Geocoder',function(){//回调函数
    geocoder = new AMap.Geocoder({
       city: "010", //城市，默认：“全国”
       radius: 1000 //范围，默认：500
    });
  });
  //地理编码,返回地理编码结果
  geocoder.getLocation(str, function(status, result) {
     if (status === 'complete' && result.info === 'OK') {
         return geocoder_CallBack(result);
     }
  });
  //地理编码返回结果展示
  function geocoder_CallBack(data) {
      //地理编码结果数组
      var geocode = data.geocodes;
      for (var i = 0; i < geocode.length; i++) {
        //拼接输出html
        resultStr.push(geocode[i].location.getLng(), geocode[i].location.getLat());
      }
      console.log(data);
      app.setState({ latAndLon: resultStr });
  }
}
