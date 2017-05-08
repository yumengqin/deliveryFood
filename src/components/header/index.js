import React from 'react'
import { Link } from 'react-router';

require('./index.less');

const menu = [
  { title: '首页', url: '/indexBuyer' },
  { title: '我的订单', url: '/allOrder' },
  { title: '我的收藏', url: '/allLike' },
]

class Header extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  render() {
    return (
      <div className="buyer-head">
        <ul>
          {
            menu.map((item, index) => (
              <li key={index}>
                <Link to={item.url}>{item.title}</Link>
              </li>
            ))
          }
          <li key="login-signup">
            <Link to={ localStorage.getItem('name') ? '/setBuyer' : '/login'}>{localStorage.getItem('name') ? localStorage.getItem('name') : '登录'}</Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default Header;
