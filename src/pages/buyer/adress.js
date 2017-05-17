import React, { PropTypes } from 'react';
import { Form, message, Input, Icon, Radio, Modal, Switch } from 'antd';
import { connect } from 'react-redux'
import { filter } from 'underscore'
import moment from 'moment'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar/buyerLeft'
import { getLatAndLon } from '../../utils/number';

const FormItem = Form.Item;
const createForm = Form.create;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

require('./adress.less');

class AdressPage extends React.Component {
  constructor(props, context){
    super(props, context);
    this.state = {
      adressArr: [],
      visible: false,
      action: 'add',
    };
  }
  componentWillMount() {
    this.getData();
  }
  getData() {
    const _this = this;
    fetch('/api/user/adress', {
      method: 'post',
      body: JSON.stringify({ userName: sessionStorage.getItem('userName') }),
      credentials: 'include'
    }).then(function(res) {
      return res.json()
    }).then(function(res) {
      _this.setState({ adressArr: res.adress || [] });
    });
  }
  renderAdress () {
    return (this.state.adressArr).map((item, index) => {
      return (
        <li key={index}>
          <Icon type="tag" className={item.status ? 'defaultAdress' : 'none'} />
          <div className="connect">
            <span>{item.connectUser} {item.connectSex}士</span>
            <p className="btnGroup">
              <i onClick={e => this.updateAdress(e, item)}>修改</i>
              <i onClick={e => this.deleteAdress(e, item)}>删除</i>
            </p>
          </div>
          <p>{item.adress}</p>
          <p>{item.connectPhone}</p>
        </li>
      );
    })
  }
  hideModel() {
    this.setState({ visible: false });
  }
  addAdress() {
    this.setState({ action: 'add', visible: true });
  }
  updateAdress(e, item) {
    this.setState({ action: 'update', visible: true });
    this.props.form.setFieldsValue({
      ...item,
    });
  }
  deleteAdress(e, item) {
    const _this = this;
    const arr = filter(this.state.adressArr, function(val) { return val.id !== item.id });
    fetch('/api/user/adress/update', {
      method: 'post',
      body: JSON.stringify({ userName: sessionStorage.getItem('userName'), adressArr: arr}),
      credentials: 'include'
    }).then(function(res) {
      return res.json()
    }).then(function(res) {
      _this.getData();
      message.success('删除成功');
    });
  }
  handelSubmit() {
    const _this = this;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) {
        console.log(err);
        return 0;
      }
      getLatAndLon(data.adress, this);
      setTimeout(function() {
        if (_this.state.latAndLon) {
          const arr = _this.state.adressArr;
          const obj = data;
          obj.latAndLon = _this.state.latAndLon;
          if(_this.state.action === 'add') {
            obj.id = new Date().getTime();
            if(obj.status) {
              arr.map((item) => {
                item.status = false;
              });
            }
            arr.push(obj);
          } else {
            if (obj.status) {
              arr.map((item, index) => {
                if (item.id === obj.id) {
                  arr[index] = obj
                } else {
                  item.status = false;
                }
              });
            } else {
              arr.map((item, index) => {
                if (item.id === obj.id) {
                  arr[index] = obj
                }
              });
            }
          }
          fetch('/api/user/adress/update', {
            method: 'post',
            body: JSON.stringify({ userName: sessionStorage.getItem('userName'), adressArr: arr}),
            credentials: 'include'
          }).then(function(res) {
            return res.json()
          }).then(function(res) {
            _this.getData();
            message.success(_this.state.action === 'add' ? '添加成功' : '修改成功');
            _this.hideModel();
          });
        } else {
            message.error('请输入有效地址');
        }
      }, 200);
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="setSeller collection">
        <LeftBar />
        <div className="rightMenu adress">
          <h1>地址管理</h1>
          <ul className="adressList">
            { this.state.adressArr.length !== 0 ? this.renderAdress() : '' }
            <li onClick={() => this.addAdress()}> + 添加新地址</li>
          </ul>
        </div>
        <Modal
          title={this.state.action === 'add' ? '添加地址' : '修改地址'}
          wrapClassName="vertical-center-modal adress-model"
          visible={this.state.visible}
          onOk={() => this.handelSubmit()}
          onCancel={() => this.hideModel()}
          okText="确定" cancelText="取消"
        >
        <Form>
          <FormItem label="姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名">
            {getFieldDecorator('connectUser', {
              rules: [
                { required: true, message: '请输入姓名' },
              ],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="性&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;别">
            {getFieldDecorator('connectSex', {
              rules: [
                { required: true, message: '请选择性别' },
              ],
            })(
              <RadioGroup>
                <Radio value="男">男</Radio>
                <Radio value="女">女</Radio>
              </RadioGroup>
            )}
          </FormItem>
          <FormItem label="详细地址">
            {getFieldDecorator('adress', {
              rules: [
                { required: true, message: '请输入详细地址' },
              ],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="联系电话">
            {getFieldDecorator('connectPhone', {
              rules: [
                { required: true, message: '请输入联系电话' },
                { pattern: /^1(3|4|5|7|8)\d{9}$/, message: '请输入正确的联系电话'}
              ],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem className="none">
            {getFieldDecorator('id', {
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="设置为默认">
            {getFieldDecorator('status', {
            })(
              <Switch />,
            )}
          </FormItem>
        </Form>
        </Modal>
      </div>
    );
  }
}

AdressPage.propTypes = {
  form: PropTypes.shape(),
  params: PropTypes.shape(),
};

export default connect()(createForm()(AdressPage));
