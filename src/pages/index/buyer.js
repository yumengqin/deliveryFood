import React from 'react';
import LazyLoad from 'react-lazyload';
import { Input } from 'antd';
import { connect } from 'react-redux'
import { findWhere } from 'underscore'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import Home from '../../components/header'
import { getDistance, getPosition } from '../../utils/number'

require('./index.less');

const Search = Input.Search;

const benchmark = [
  { title: '全部商家', key: '' },
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
      activeIndex: 0,
      data: '',
      flag: false,
    };
  }
  componentWillMount() {
    this.getData();
    this.getAdress();
  }
  getAdress() {
    const _this = this;
    fetch('/api/user/adress', {
      method: 'post',
      body: JSON.stringify({ userName: localStorage.getItem('userName') }),
      credentials: 'include'
    }).then(function(res) {
      return res.json()
    }).then(function(res) {
      _this.setState({ adressArr: res.adress });
    }).then(() => {
      // console.log(findWhere(this.state.adressArr, { status: true }));
      if (findWhere(this.state.adressArr, { status: true })) {
        const adr = findWhere(this.state.adressArr, { status: true });
        this.setState({ adress: adr.adress, latAndLon: adr.latAndLon });
        localStorage.setItem('adress', JSON.stringify(adr));
      } else {
        getPosition(_this);
      }
    });
  }
  setAdress(e, item) {
    this.setState({ adress: item.adress, latAndLon: item.latAndLon });
    localStorage.setItem('adress', JSON.stringify(item));
  }
  showAdressList() {
    this.setState({ flag: !this.state.flag });
  }
  getData(type) {
    // 查询店铺
    const _this = this;
    fetch('/api/store/filter', {
      method: 'post',
      body: JSON.stringify({ type: type }),
      credentials: 'include'
    }).then(function(res) {
      return res.json()
    }).then(function(res) {
      _this.setState({ data: res.data });
    })
  }
  handleBench(e, index, type) {
    this.setState({ activeIndex: index });
    this.getData(type);
  }
  toStore(e, owner) {
    hashHistory.push(`/store/${owner}`);
  }
  render() {
    return (
      <div>
        <Home />
        <div className="buyer">
          <div className="adress clear">
            <div title={this.state.adress || ''}>
              <span>当前位置：</span>{this.state.adress || '定位失败'}
            </div>
            <strong onClick={() => this.showAdressList()}>
              切换地址
              <ul className={this.state.flag ? '' : 'none'}>
                {
                  (this.state.adressArr || []).map((item, index) => {
                    return <li key={index} onClick={e => this.setAdress(e, item)}>{item.adress}</li>
                  })
                }
                <li key="position" onClick={() => getPosition(this)}>定位到当前位置</li>
              </ul>
            </strong>
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
              benchmark.map((item, index) => {
                return <li key={item.key} onClick={e => this.handleBench(e, index, item.key)} className={this.state.activeIndex === index ? 'active' : ''}>{item.title}</li>
              })
            }
          </ul>
          <div className="store clear">
            {
              (this.state.data && this.state.data.length !== 0) ?
              (this.state.data).map((item, index) => {
                return (
                  <LazyLoad once key={index} className={getDistance(this.state.latAndLon, item.latAndLon) ? '' : 'none'}>
                    <div className="storeItem" onClick={e => this.toStore(e, item.owner)}>
                      <p className="storeImg"><img src={item.selfImg ? item.selfImg : ''} /></p>
                      <div className="storeInfo">
                        <h2>{item.storeName}</h2>
                        <p>{item.adress}</p>
                        <p>配送费：¥{item.sendPrice || 0.00}</p>
                        <div className="storeOption">
                          { item.option && item.option.indexOf('onTime') !== -1 ? <span>准</span> : '' }
                          { item.option && item.option.indexOf('safe') !== -1 ? <span>保</span> : '' }
                          { item.option && item.option.indexOf('invoice') !== -1 ? <span>票</span> : '' }
                        </div>
                      </div>
                      <div className="positionItem">
                        <div className="popover-arrow"></div>
                        <h1>{item.storeName}</h1>
                        <ul>
                          { item.option && item.option.indexOf('onTime') !== -1 ? <p className="pospover-activitys"><span>准</span> 准时必达，超时秒赔</p> : '' }
                          { item.option && item.option.indexOf('safe') !== -1 ? <p className="pospover-activitys"><span>保</span> 已加入“外卖保”计划，食品安全有保障</p> : '' }
                          { item.option && item.option.indexOf('invoice') !== -1 ? <p className="pospover-activitys"><span>票</span> 该商家支持开发票，请在下单时填写好发票抬头</p> : '' }
                        </ul>
                        <p className="price">配送费：{item.sendPrice} | 平均到达时间：{getDistance(this.state.latAndLon, item.latAndLon)}</p>
                        { item.introduction ? <p>{item.introduction}</p> : ''}
                      </div>
                    </div>
                  </LazyLoad>
                );
              }) : <p style={{ textAlign: 'center' }}>暂无匹配的店铺</p>
            }
          </div>
        </div>
      </div>
    );
  }
}

export default IndexPage;
