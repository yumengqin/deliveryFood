import React, { PropTypes } from 'react';
import { connect } from 'react-redux'
import { Carousel, Icon, message, InputNumber, Badge, Rate } from 'antd'
import { without } from 'underscore'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory, Link } from 'react-router'
import Home from '../../components/header'
import { getDistance, getPosition, toTime } from '../../utils/number'

require('./index.less');

const liItem = [
  { title: '默认排序', icon: false, key: '' },
  { title: '评分', icon: true, key: 'score' },
  { title: '销量', icon: true, key: 'orderNum' },
  { title: '价格', icon: true, key: 'price' },
];
class IndexPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      shopVisible: false,
      remarkFlag: false,
      data: '',
      remark: '',
      shop: [],
      showIndex: 0,
      sortIndex: 0,
      typeIndex: 0,
      shopNum: 0,
    }
  }
  componentWillMount() {
    this.getAdress();
    this.getCart();
    this.getRemark();
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
    });
    fetch('/api/user/collect', {
      method: 'post',
      body: JSON.stringify({ userName: sessionStorage.getItem('userName') }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ collect: res.data.collectArr ? res.data.collectArr.indexOf(_this.props.params.id) !== -1 : false, collectArr: res.data.collectArr || []});
    });

    // 查询用户收藏店铺
    // fetch('/api/user/collect/show', {
    //   method: 'post',
    //   body: JSON.stringify({ userName: sessionStorage.getItem('userName') }),
    //   credentials: 'include'
    // }).then(function(res) {
    //   return res.json();
    // }).then(function(res) {
    //   console.log(res);
    // });
  }
  renderCarousel() {
    if(this.state.data && this.state.data.album.length !== 0) {
      return this.state.data.album.map((item, index) => {
        return <div key={index}><img src={item} /></div>
      });
    }
    return <div className="default"></div>
  }
  getCart() {
    const cart = sessionStorage.getItem('cart'+this.props.params.id) ? JSON.parse(sessionStorage.getItem('cart'+this.props.params.id)) : [];
    this.setState({
      shop: cart,
      shopNum: cart.length,
    });
  }
  getAdress() {
    const _this = this;
    if (sessionStorage.getItem('adress')) {
      const adr = JSON.parse(sessionStorage.getItem('adress'));
      this.setState({ adress: adr.adress, latAndLon: adr.latAndLon });
    } else {
      fetch('/api/user/adress', {
        method: 'post',
        body: JSON.stringify({ userName: sessionStorage.getItem('userName') }),
        credentials: 'include'
      }).then(function(res) {
        return res.json()
      }).then(function(res) {
        _this.setState({ adressArr: res.adress });
      }).then(() => {
        if (this.state.adress.length !== 0) {
          const defaultAdress = findWhere(this.state.adress, { status: true });
          _this.setState({ adress: defaultAdress.adress, latAndLon: defaultAdress.latAndLon });
        } else {
          getPosition(_this);
        }
      });
    }
  }
  getRemark() {
    const _this = this;
    fetch('/api/remark/show', {
      method: 'post',
      body: JSON.stringify({
        owner : _this.props.params.id,
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ remark: res.data });
    });
  }
  show(e, index) {
    this.setState({ showIndex: index, remarkFlag: false });
  }
  showRemark(e, index) {
    this.setState({ showIndex: index, remarkFlag: true });
  }
  sort(e, index, key) {
    const _this = this;
    fetch('/api/store/menu', {
      method: 'post',
      body: JSON.stringify({
        userName : _this.props.params.id,
        sort: key,
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ menu: res.menu, sortIndex: index, remarkFlag: false });
    });
  }
  type(e, index, type) {
    const _this = this;
    this.setState({ typeIndex: index });
    const obj = (type === '全部菜品' ? { owner: _this.props.params.id } : { owner: _this.props.params.id, type: type });
    fetch('/api/menu/filter', {
      method: 'post',
      body: JSON.stringify(obj),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ menu: res.data });
    });
  }
  addCar(e, item) {
    const test = item;
    test.number = 1;
    const userCart = sessionStorage.getItem('cart'+this.props.params.id) ? JSON.parse(sessionStorage.getItem('cart'+this.props.params.id)) : [];
    userCart.push(test);
    sessionStorage.setItem('cart'+this.props.params.id, JSON.stringify(userCart));
    this.getCart();
  }
  changeNumber (e, id, type) {
    let number = this.shopNum(id);
    const cart = JSON.parse(sessionStorage.getItem('cart'+this.props.params.id));
    let res = cart;
    if (type === 'add') {
      number ++;
    } else {
      number --;
    }
    cart.map((item, index) => {
      if (item.id === id) {
        if(number !== 0) {
          res[index].number = number;
        } else {
          res.splice(index, 1);
        }
        return 0;
      }
    });
    sessionStorage.setItem('cart'+this.props.params.id, JSON.stringify(res));
    this.getCart();
  }
  shopHave(id) {
    let res = false;
    const cart = sessionStorage.getItem('cart'+this.props.params.id) ? JSON.parse(sessionStorage.getItem('cart'+this.props.params.id)) : [];
    cart.map(item => {
      if(item.id === id && item.number !== 0) {
        res = true;
      };
    });
    return res;
  }
  shopNum(id) {
    let res = 1;
    const cart = sessionStorage.getItem('cart'+this.props.params.id) ? JSON.parse(sessionStorage.getItem('cart'+this.props.params.id)) : [];
    cart.map(item => {
      if(item.id === id) {
        res = item.number;
      };
    });
    return res;
  }
  showShop() {
    this.setState({ shopVisible: !this.state.shopVisible });
  }
  getAllPrice() {
    const cart = sessionStorage.getItem('cart'+this.props.params.id) ? JSON.parse(sessionStorage.getItem('cart'+this.props.params.id)) : [];
    let res = 0;
    cart.map(item => {
      res += (item.price + item.boxPrice) * item.number;
    });
    return '¥' + res;
  }
  renderTypeMenu() {
    if(this.state.data.typeMenu[0] != '全部菜品') {
      this.state.data.typeMenu.splice(0, 0, '全部菜品');
    }
    return (this.state.data.typeMenu).map((item, index) => {
      return (<li key={index} className={this.state.typeIndex === index ? 'active' : ''} onClick={e => this.type(e, index, item)}>{item}</li>);
    })
  }
  renderList() {
    return (this.state.menu).map((item, index) => {
      return (<li key={index} className="menuItem">
        <img src={item.img} />
        <div className="menuInfo">
          <h2>{item.menuName}</h2>
          <p>{item.intro || '...'}</p>
          <p>出售{item.orderNum || 0}份<Rate disabled value={item.score} /></p>
          <strong>¥{item.price}元 <span>餐盒费：{item.boxPrice || 0}元</span></strong>
          <button onClick={e => this.addCar(e, item)} className={this.shopHave(item.id) ? 'none' : ''}>加入购物车</button>
          <div className={this.shopHave(item.id) ? 'inputNumber' : 'none'}>
            <span onClick={e => this.changeNumber(e, item.id, 'add')}>+</span>
            <p>{this.shopNum(item.id)}</p>
            <span onClick={e => this.changeNumber(e, item.id, 'sub')}>-</span>
          </div>
        </div>
      </li>);
    })
  }
  clearShop() {
    sessionStorage.removeItem('cart'+this.props.params.id);
    this.getCart();
  }
  rederShopList() {
    const cart = sessionStorage.getItem('cart'+this.props.params.id) ? JSON.parse(sessionStorage.getItem('cart'+this.props.params.id)) : [];
    return cart.map((item, index) => {
      return (
        <li key={index}>
          <i>{item.menuName}</i>
          <div className={this.shopHave(item.id) ? 'inputNumber' : 'none'}>
            <span onClick={e => this.changeNumber(e, item.id, 'add')}>+</span>
            <p>{this.shopNum(item.id)}</p>
            <span onClick={e => this.changeNumber(e, item.id, 'sub')}>-</span>
          </div>
          <strong>¥{(item.price + item.boxPrice) * item.number}</strong>
        </li>
      )
    })
  }
  collect() {
    let arr = [];
    const _this = this;
    if (this.state.collect) {
      arr = without(this.state.collect, _this.props.params.id);
    } else {
      arr.push(_this.props.params.id);
    }
    fetch('/api/user/setCollect', {
      method: 'post',
      body: JSON.stringify({ userName: sessionStorage.getItem('userName'), collectArr: arr }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      if (_this.state.collect) {
        message.success('已取消收藏')
      } else {
        message.success('收藏成功')
      }
      _this.setState({ collectArr: res.data, collect: !_this.state.collect });
    });
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
                <Rate disabled value={this.state.data.star || 0} />
                <span className="dealed">已售出{this.state.data && this.state.data.orderNum ? this.state.data.orderNum : 0}单</span>
              </h1>
            </div>
            <ul>
              <li key="0">配送费 <span>¥{this.state.data && this.state.data.sendPrice ? this.state.data.sendPrice : 0}元</span></li>
              <li key="1">送达时间 <span>{this.state.data && this.state.data.latAndLon ? getDistance(this.state.data.latAndLon, this.state.latAndLon) : 0}</span></li>
            </ul>
            <p className="collect" onClick={() => this.collect()}>
              {this.state.collect ? <Icon type="heart" /> : <Icon type="heart-o" />}
              <span>{this.state.collect ? '已收藏' : '收藏'}</span>
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
            <li key="1" className={this.state.showIndex === 1 ? 'active' : ''} onClick={e => this.showRemark(e, 1)}>评价</li>
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
        <div className={this.state.remarkFlag ? 'main none' : 'main'}>
          <ul className="typeMenu">
            { this.state.data && this.state.data.typeMenu ? this.renderTypeMenu() : ''}
          </ul>
          <ul className="listMenu">
            { this.state.menu ? this.renderList() : '暂无匹配菜品'}
          </ul>
        </div>
        <div className={this.state.remarkFlag ? 'remark main' : 'remark none'}>
          <ul className="remarkList">
            {
              (this.state.remark || []).map((item, index) => {
                return (
                  <li key={index} className="remarkItem">
                    <p><span>用户</span>{item.name}</p>
                    <div>
                      <Rate disabled value={item.score} />
                      <span className="text">{item.text || '暂无评价'}</span>
                      <h4>{toTime(item.createDate)}</h4>
                    </div>
                  </li>
                );
              })
            }
          </ul>
        </div>
        <div className="shopCar">
          <div className={this.state.shopVisible ? 'shopList' : 'shopList none'}>
            <h1>购物车<span onClick={() => this.clearShop()}>[清空]</span></h1>
            <ul>
              { this.rederShopList() }
            </ul>
          </div>
          <div className="carBtn">
            <Badge count={this.state.shopNum} style={{ backgroundColor: '#87d068' }} className={this.state.shopNum ? '' : 'none'}/>
            <button onClick={() => this.showShop()}><Icon type="shopping-cart" /><span>{this.getAllPrice()}</span>配送费 ¥{this.state.data.sendPrice}元</button>
            <Link to={this.state.shopNum ? (sessionStorage.getItem('userName') ? `/settle/${this.props.params.id}` : {pathname: '/login', query: { to: `/store/${this.props.params.id}`}}) : ''} className={this.state.shopNum ? 'btn settle' : 'btn'}>
              { this.state.shopNum ? '去结算 > ' : '购物车是空的' }
            </Link>
          </div>
        </div>
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
