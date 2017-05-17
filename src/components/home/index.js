import React from 'react'
import { Link, hashHistory } from 'react-router';

const card = ([
  { title: '快捷便当', key: 'quick', word: '&#xe61f;' },
  { title: '小吃夜宵', key: 'supper', word: '&#xe61a;' },
  { title: '鲜花蛋糕', key: 'flower_cake', word: '&#xe621;' },
  { title: '水果蔬菜', key: 'fruit', word: '&#xe622;' },
]);

require('./index.less');

class Home extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      type: '',
    };
  }
  componentWillMount() {
    this.props.checkLogin();
  }
  click () {
    fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        email: '123',
        answer: '234'
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      console.log(data);
    })
  }
  hover(key){
    this.setState({ type: key });
  }
  out () {
    this.setState({ type: '' });
  }
  click(type) {
    hashHistory.push({ pathname: '/indexBuyer', query: { type: type }});
  }
  search() {
    hashHistory.push({ pathname: '/indexBuyer', query: { text: this.state.text || '' }});
  }
  changeInput(e) {
    this.setState({ text: e.target.value });
  }
  render() {
    if (this.props.nickName !== '') {
      return null;
    } else {
      return (
        <div className='homePage'>
          <div className="top">
            <Link to='/login'>登录</Link>
            <Link to='/signup'>注册</Link>
            <Link to='/open' className='open'>我要开店</Link>
          </div>
          <div className="search">
            <h2>{this.state.type ? this.state.type : 'DeliveryFood.com'}</h2>
            <ul>
              <li key='quick' onMouseOver={() => this.hover('快捷便当')} onMouseOut={() => this.out()} onClick={() => this.click('quick')}><i className="iconfont">&#xe61f;</i></li>
              <li key='supper' onMouseOver={() => this.hover('小吃夜宵')} onMouseOut={() => this.out()} onClick={() => this.click('supper')}><i className="iconfont">&#xe61a;</i></li>
              <li key='flower_cake' onMouseOver={() => this.hover('鲜花蛋糕')} onMouseOut={() => this.out()} onClick={() => this.click('flower_cake')}><i className="iconfont">&#xe621;</i></li>
              <li key='fruit' onMouseOver={() => this.hover('水果蔬菜')} onMouseOut={() => this.out()} onClick={() => this.click('fruit')}><i className="iconfont">&#xe622;</i></li>
            </ul>
            <div className="searchbtn">
              <input onChange={e => this.changeInput(e)}/>
              <button onClick={() => this.search()}>SEARCH</button>
            </div>
          </div>
        </div>
      )
    }

  }
}

export default Home
