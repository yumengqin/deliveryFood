import React, { PropTypes } from 'react';
import { connect } from 'react-redux'
import { Carousel, Icon } from 'antd'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import Home from '../../components/header'
import { getDistance } from '../../utils/number'

require('./index.less');

const liItem = [
  { title: '默认排序', icon: false, key: '' },
  { title: '评分', icon: true, key: 'score' },
  { title: '销量', icon: true, key: 'sellNum' },
  { title: '价格', icon: true, key: 'price' },
];
class IndexPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      data: '',
      showIndex: 0,
      sortIndex: 0,
      typeIndex: 0,
    }
  }
  componentWillMount() {
    this.getAdress();
    var _this = this;
    fetch('/api/store', {
      method: 'post',
      body: JSON.stringify({
        userName : _this.props.params.id,
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ data: res.data, menu: res.menu });
    })
  }
  renderCarousel() {
    if(this.state.data && this.state.data.album.length !== 0) {
      return this.state.data.album.map((item, index) => {
        return <div key={index}><img src={item} /></div>
      });
    }
    return <div className="default"></div>
  }
  getAdress() {
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
        console.log('经度：' + data.position.getLng(), '纬度：' + data.position.getLat());
         app.setState({ adress: data.formattedAddress, latAndLon: [data.position.getLng(), data.position.getLat()] });
      }
      //解析定位错误信息
      function onError(data) {
         console.log(data);
      }
  }
  show(e, index) {
    this.setState({ showIndex: index });
  }
  sort(e, index, key) {
    console.log(key);
    this.setState({ sortIndex: index });
  }
  type(e, index) {
    this.setState({ typeIndex: index });
  }
  renderTypeMenu() {
    if(this.state.data.typeMenu[0] != '全部菜品') {
      this.state.data.typeMenu.splice(0, 0, '全部菜品');
    }
    return (this.state.data.typeMenu).map((item, index) => {
      return (<li key={index} className={this.state.typeIndex === index ? 'active' : ''} onClick={e => this.type(e, index)}>{item}</li>);
    })
  }
  renderList() {
    return (this.state.menu).map((item, index) => {
      return (<li key={index}>
        <img src={item.img} />
        <div className="menuInfo">
          <h2>{item.menuName}</h2>
          <p>{item.intro || '...'}</p>
          <p>出售{item.orderNum || 0}份</p>
          <strong>¥{item.price}元</strong>
          <button>加入购物车</button>
        </div>
      </li>);
    })
  }
  render() {
    return (
      <div className="storeShow">
        <Home />
        <div className="storeBanner">
          <div className="storeInfo">
            <div className="clear">
              <img src={this.state.data && this.state.data.selfImg ? this.state.data.selfImg : ''}/>
              <h1>
                {this.state.data && this.state.data.storeName ? this.state.data.storeName : <span>店铺暂时没有店名</span>}
                <span>已售出{this.state.data && this.state.data.orderNum ? this.state.data.orderNum : 0}单</span>
              </h1>
            </div>
            <ul>
              <li key="0">配送费 <span>¥{this.state.data && this.state.data.sendPrice ? this.state.data.sendPrice : 0}元</span></li>
              <li key="1">送达时间 <span>{this.state.data && this.state.data.latAndLon ? getDistance(this.state.data.latAndLon, this.state.latAndLon) : 0}</span></li>
            </ul>
            <p className="collect">
              <Icon type="heart-o" />
              <span>收藏</span>
            </p>
          </div>
          <Carousel>
            { this.renderCarousel() }
          </Carousel>
        </div>
        <div className="topHeader clear">
          <ul className="header-left">
            <li key="0" className={this.state.showIndex === 0 ? 'active' : ''} onClick={e => this.show(e, 0)}>所有商品</li>
            <span></span>
            <li key="1" className={this.state.showIndex === 1 ? 'active' : ''} onClick={e => this.show(e, 1)}>评价</li>
          </ul>
          <ul className="header-right">
            {
              liItem.map((item, index) => {
                return (
                  <li key={index} className={this.state.sortIndex === index ? 'active' : ''} onClick={e => this.sort(e, index, item.key)}>
                    {item.title}{item.icon ? <Icon type="arrow-down" /> : ''}
                  </li>
                )
              })
            }
          </ul>
        </div>
        <div className="main">
          <ul className="typeMenu">
            { this.state.data && this.state.data.typeMenu ? this.renderTypeMenu() : ''}
          </ul>
          <ul className="listMenu">
            { this.state.menu ? this.renderList() : '暂无匹配菜品'}
          </ul>
        </div>
        <div className="shopCar"></div>
      </div>
    );
  }
}

// <li key="0">默认排序</li>
// <li key="1">评分<Icon type="arrow-down" /></li>
// <li key="2">销量<Icon type="arrow-down" /></li>
// <li key="3">价格<Icon type="arrow-down" /></li>

IndexPage.propTypes = {
  form: PropTypes.shape(),
  params: PropTypes.shape(),
};

export default IndexPage;
