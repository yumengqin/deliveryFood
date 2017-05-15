import React from 'react'
import { hashHistory, Link } from 'react-router'
import { Upload, Icon, Menu, message } from 'antd';

const SubMenu = Menu.SubMenu;

require('./index.less');

const menu = [
  { title: '设置', url: '' },
];

const upImgProps = app => ({
  name: 'uploadFile',
  action: 'http://localhost:5000/api/sellerImg/upload',
  listType: 'picture',
  data: { userName: localStorage.getItem('userName') },
  beforeUpload(file) {
    const type = file.type;
    if (type !== 'image/jpeg' && type !== 'image/jpg' && type !== 'image/png') {
      message.error('仅支持上传jpg,jpeg和png格式的图片');
      return false;
    } else if (file.size / 1024 / 1024 > 1) {
      message.error('上传图片大小不能超过1M');
      return false;
    }
    app.setState({ file: file });
    return true;
  },
  onChange(info) {
    const status = info.file.status;
    if (status === 'done') {
      message.success('上传成功');
      // app.setState({ selfImg: info.file.response.imgUrl });
      app.setState({ uploading: false });
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
});

class leftBar extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state={
      selfImg: '',
    }
  }
  componentWillMount() {
    if (!localStorage.getItem('userName')) {
      hashHistory.push('/');
    }
    const _this = this;
    fetch('/api/user', {
      method: 'post',
      body: JSON.stringify({
        userName : localStorage.getItem('userName'),
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ data: res.data });
    })
  }
  handleStatus(e) {
    if (e.key === 'close') {
      this.setState({ storeStstus: 'close' });
    } else if (e.key === 'open') {
      this.setState({ storeStstus: 'open' });
    }
  }
  logout() {
    localStorage.clear();
    hashHistory.push('/');
  }
  render() {
    return (
      <div className="leftBar">
        <ul>
          <Upload className="avatar-uploader" {...upImgProps(this)}>
              {
                (this.state.data && this.state.data.selfImg) ?
                  <img src={this.state.data.selfImg} alt="" className="avatar" /> :
                  <Icon type="plus" className="avatar-uploader-trigger" />
              }
            </Upload>
            <Menu
              mode="inline"
              style={{ width: 240 }}
              onClick={e => this.handleStatus(e)}
            >
              <SubMenu key="sub4" title={<span><Icon type="setting" /><span>设置</span></span>}>
                <Menu.Item key="seller">
                  <Link to='/setBuyer'><Icon type="user" />个人信息</Link>
                </Menu.Item>
                <Menu.Item key="store">
                  <Link to='/collection'><Icon type="heart-o" />我的收藏</Link>
                </Menu.Item>
                <Menu.Item key="order">
                  <Link to='/buyer/order'><Icon type="file-text" />我的订单</Link>
                </Menu.Item>
                <Menu.Item key="adress">
                  <Link to='/setAdress'><Icon type="environment-o" />我的地址</Link>
                </Menu.Item>
              </SubMenu>
            </Menu>
            <Link to="indexBuyer" className="goShop"><Icon type="arrow-right" />逛一逛</Link>
            <button onClick={() => this.logout()} className="out-btn"><Icon type="logout" />退出登录</button>
        </ul>
      </div>
    );
  }
}

export default leftBar;
