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
    return numeral(value).format('0,0.[000]');
  }
  return numeral(value).format('0,0.000');
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
