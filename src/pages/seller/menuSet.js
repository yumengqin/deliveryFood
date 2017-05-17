import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Form, Modal, Button, DatePicker, message, Spin, Input, Icon, Radio, Carousel, Select, Upload } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar'
import { toDate, toTime } from '../../utils/number'


const FormItem = Form.Item;
const createForm = Form.create;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;

require('./menuSet.less');

export const toNumber = (v) => {
  if (v === undefined) {
    return v;
  }
  if (v === '') {
    return undefined;
  }
  if (v && `${v}`.trim() === '') {
    return NaN;
  }
  return Number(v);
};

class IndexPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state={
      data: '',
      store: '',
      add: false,
      menuHeight: 400,
      visible: false,
      typeError: '',
      activeIndex: -1,
    };
  }
  componentWillMount() {
    var _this = this;
    fetch('/api/store', {
      method: 'post',
      body: JSON.stringify({
        userName : sessionStorage.getItem('userName'),
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ data: res.data, menu: res.menu });
    })
  }
  componentDidMount() {
    const list = this.refs.menuList;
    const type = this.refs.menuType;
    this.setState({ menuHeight: Math.min(list.offsetHeight, type.offsetHeight)});
    console.log(list.offsetHeight);
  }
  renderCarousel() {
    if(this.state.data && this.state.data.album.length !== 0) {
      return this.state.data.album.map((item, index) => {
        return <div key={index}><img src={item} /></div>
      });
    }
    return <div className="default"></div>
  }
  renderMenu() {
    console.log(this);
    if(this.state.menu && this.state.menu.length !== 0) {
      return this.state.menu.map((item, index) => {
        return (
          <div key={index} className="menuItem">
            <div className="info">
              <h3>{item.menuName}</h3>
              <h4>¥ {item.price}</h4>
              <p>{item.intro}</p>
              <Link to={`/setMenu/${item.id}`}>编辑</Link>
            </div>
            <img src={item.img} />
          </div>
        );
      });
    }
    return <div className="noMenu">暂无菜品</div>
  }
  addClick() {
    this.setState({ add: !this.state.add });
  }
  showModel() {
    this.setState({ visible: true });
  }
  addNew() {
    hashHistory.push('/setMenu/addMenu');
  }
  handleOk() {
    this.handleCancel();
  }
  handleCancel() {
    this.setState({ visible: false, newMenu: false });
  }
  handleAddType(e) {
    const _this = this;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err || !data.typeName) {
        console.log(err);
        return 0;
      }
      const test = this.state.data;
      test.userName = this.state.data.owner;
      test.typeMenu.push(data.typeName);
      fetch('/api/store/update', {
        method: 'post',
        body: JSON.stringify(test),
        credentials: 'include'
      }).then(function(res) {
        return res.json();
      }).then(function(res) {
        if(res.success) {
          message.success('添加成功');
          _this.setState({ data: res.data, visible: false });
        } else {
          message.error('添加失败');
        }
      })
    });
  }
  changeType(e, item, index) {
    const _this = this;
    const test = { owner: this.state.data.owner, type: item };
    fetch('/api/menu/filter', {
      method: 'post',
      body: JSON.stringify(test),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      if(res.success) {
        _this.setState({ menu: res.data, activeIndex: index });
      }
    })
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="setSeller setMenu">
        <LeftBar />
        <div className="rightMenu">
          <h1>{this.state.data && this.state.data.storeName ? this.state.data.storeName : <span>店铺暂时没有店名，<Link to="/setStore">去设置</Link></span>}</h1>
          <Carousel>
            { this.renderCarousel() }
          </Carousel>
          <div className="menu">
            <ul className="menuType" ref="menuType" style={{ height: this.state.menuHeight}}>
              <li key="all" onClick={e => this.changeType(e, '全部', -1)} className={this.state.activeIndex == -1 ? 'active' : ''}>全部菜品</li>
              {
                (this.state.data.typeMenu || []).map((item, index) =>{
                  return <li key={index} onClick={e => this.changeType(e, item, index)} className={this.state.activeIndex === index ? 'active' : ''}>{item}</li>
                })
              }
            </ul>
            <div className="menuList" ref="menuList" style={{ height: this.state.menuHeight}}>
              <ul>{ this.renderMenu()}</ul>
              <button className={this.state.add ? "addBtn addType" : "addBtn addType none"} onClick={() => this.showModel()}><Icon type="appstore" />添加分类</button>
              <button className={this.state.add ? "addBtn addMenu" : "addBtn addMenu none"} onClick={() => this.addNew()}><Icon type="edit" />添加菜品</button>
              <button className="addBtn" onClick={() => this.addClick()}><Icon type="plus" />添加</button>
            </div>
          </div>
        </div>
        <Modal title="添加新的分类" visible={this.state.visible}
          onOk={e => this.handleAddType(e)} onCancel={() => this.handleCancel()}
          okText="添加" cancelText="取消"
        >
          <Form>
            <FormItem label="分类名称" extra={this.state.typeError}>
              {getFieldDecorator('typeName', {
                rules: [
                  { required: true, message: '请输入分类名称' },
                ],
              })(
                <Input />
              )}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

IndexPage.propTypes = {
  form: PropTypes.shape(),
};

export default connect()(createForm()(IndexPage));
