import React, { PropTypes } from 'react';
import { Form, Button, Select, message, Spin, Input, Icon, Radio } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar'
import { toDate, toTime } from '../../utils/number'

require('./sellerSet.less');

const FormItem = Form.Item;
const createForm = Form.create;
const Option = Select.Option;


class IndexPage extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  componentWillMount() {
    this.getData();
  }
  getData() {
    const _this = this;
    fetch('/api/store', {
      method: 'post',
      body: JSON.stringify({
        userName : localStorage.getItem('userName'),
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.props.form.setFieldsValue({
        ...res.data,
      });
      _this.setState({ data: res.data });
    })
  }
  handleSubmit(e){
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) {
        console.log(err);
        return 0;
      }
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="setSeller">
        <LeftBar />
        <h1>设置店铺信息</h1>
          <Form onSubmit={e => this.handleSubmit(e)}>
            <FormItem label="店铺责任人">
              {getFieldDecorator('ownerName', {
                rules: [
                  { required: true, message: '不能为空' },
                ],
              })(
                <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} readOnly/>
              )}
            </FormItem>
            <FormItem label="店铺联系方式">
              {getFieldDecorator('phone', {
                rules: [
                  { required: true, message: '请输入电话号码' },
                ],
              })(
                <Input prefix={<Icon type="mobile" style={{ fontSize: 13 }} />} />
              )}
            </FormItem>
            <FormItem label="店铺地址">
              {getFieldDecorator('adress', {
                rules: [
                  { required: true, message: '请输入电话号码' },
                ],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="店铺类型">
              {getFieldDecorator('type', {})(
                <Select placeholder="请选择店铺类型">
                  <Option value="quick">快捷便当</Option>
                  <Option value="feature">特色菜系</Option>
                  <Option value="supper">小吃夜宵</Option>
                  <Option value="dessert">甜品饮品</Option>
                  <Option value="fruit">果蔬生鲜</Option>
                  <Option value="flower_cake">鲜花蛋糕</Option>
                  <Option value="market">商店超市</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label="店铺关键字">
              {getFieldDecorator('keyWord', {
                rules: [],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="注册时间" className="justShow">
              <Input readOnly value={this.state && this.state.data && toTime(this.state.data.startDate)}/>
            </FormItem>
            <FormItem className="saveBtn">
              <Button type="primary" htmlType="submit">保存</Button>
            </FormItem>
          </Form>
      </div>
    );
  }
}

IndexPage.propTypes = {
  form: PropTypes.shape(),
};

export default createForm()(IndexPage);
