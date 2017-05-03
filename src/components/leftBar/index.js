import React from 'react'
import { Link } from 'react-router';
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
      storeStstus: 'open',
    }
  }
  componentWillMount() {
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
              <SubMenu
                key="status"
                title={<span><Icon type={this.state.storeStstus === 'open' ? 'unlock' : 'lock'} /><span>{this.state.storeStstus === 'open' ? '开启中' : '已关店'}</span></span>}
              >
                <Menu.Item key="open">开店</Menu.Item>
                <Menu.Item key="close">关店</Menu.Item>
              </SubMenu>
              <SubMenu key="sub4" title={<span><Icon type="setting" /><span>设置</span></span>}>
                <Menu.Item key="store">店铺设置</Menu.Item>
                <Menu.Item key="order">菜品设置</Menu.Item>
              </SubMenu>
            </Menu>
        </ul>
      </div>
    );
  }
}

export default leftBar;
