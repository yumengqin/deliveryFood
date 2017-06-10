import React from 'react'
import { Link } from 'react-router';

require('./index.less');

const menu = [
  { title: '首页', url: '/indexBuyer' },
  { title: '我的订单', url: '/buyer/order' },
  { title: '我的收藏', url: '/collection' },
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
            <Link to={ sessionStorage.getItem('name') ? '/setBuyer' : '/login'}>{sessionStorage.getItem('name') ? sessionStorage.getItem('name') : '登录'}</Link>
          </li>
        </ul>
      </div>
    );
  }
}

export default Header;
