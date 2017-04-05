import React from 'react'
import { Link } from 'react-router';
// import { hashHistory } from 'react-router'

const card = ([
  { title: '便当快餐', key: 'food', word: '&#xe61f;' },
  { title: '披萨汉堡', key: 'westfood', word: '&#xe61a;' },
  { title: '鲜花蛋糕', key: 'flower_cake', word: '&#xe621;' },
  { title: '水果蔬菜', key: 'fruits', word: '&#xe622;' },
]);

require('./index.less');

class Login extends React.Component {
  constructor(props, context) {
    super(props, context);
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
    let str = '';
    if (key == 'food') {str = 'food';}
    console.log(str);
  }
  render() {
    var handleClick = this.props.handleClick.bind(this);
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
            <h2>DeliveryFood.com</h2>
            <ul>
              <li key='food' onMouseOver={this.hover.bind(this, 'food')}><i className="iconfont">&#xe61f;</i></li>
              <li key='westfood' onMouseOver={this.hover.bind('westfood')}><i className="iconfont">&#xe61a;</i></li>
              <li key='flower_cake' onMouseOver={this.hover.bind('flower_cake')}><i className="iconfont">&#xe621;</i></li>
              <li key='fruits' onMouseOver={this.hover.bind('fruits')}><i className="iconfont">&#xe622;</i></li>
            </ul>
            <div className="searchbtn">
              <input />
              <button onClick={this.click}>SEARCH</button>
            </div>
          </div>
        </div>
      )
    }

  }
}

export default Login
