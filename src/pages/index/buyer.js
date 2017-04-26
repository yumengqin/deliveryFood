import React from 'react';
import LazyLoad from 'react-lazyload';
import { Input } from 'antd';
import { connect } from 'react-redux'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import Home from '../../components/header'


require('./index.less');

const Search = Input.Search;

const benchmark = [
  { title: '全部商家', key: 'all' },
  { title: '快捷便当', key: 'quick' },
  { title: '特色菜系', key: 'feature' },
  { title: '小吃夜宵', key: 'supper' },
  { title: '甜品饮品', key: 'dessert' },
  { title: '果蔬生鲜', key: 'fruit' },
  { title: '鲜花蛋糕', key: 'flower_cake' },
  { title: '商店超市', key: 'market' },
];

class IndexPage extends React.Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      adress: '',
      benchmark: benchmark[0].key,
    };
  }
  componentWillMount() {
    var app = this;
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
       app.setState({ adress: data.formattedAddress });
    }
    //解析定位错误信息
    function onError(data) {
       console.log(data);
    }
  }
  handleBench(e, key) {
    this.setState({ benchmark: key });
  }
  render() {
    return (
      <div>
        <Home />
        <div className="buyer">
          <div className="adress">
            <p title={this.state.adress || ''}><span>当前位置：</span>{this.state.adress || '定位失败'}</p>
              <Search
                placeholder="搜索商家，美食..."
                style={{ width: '100%' }}
                onSearch={value => console.log(value)}
              />
          </div>
          <p className="banner"><strong></strong></p>
          <ul className="classify">
            <h4>全部分类：</h4>
            {
              benchmark.map(item => {
                return <li key={item.key} onClick={e => this.handleBench(e, item.key)} className={this.state.benchmark === item.key ? 'active' : ''}>{item.title}</li>
              })
            }
          </ul>
          <div>
            <LazyLoad once >
              <p>123</p>
            </LazyLoad>
          </div>
        </div>
      </div>
    );
  }
}

export default IndexPage;
