import React, { PropTypes } from 'react';
import { Form, Button, message, Spin, Input, Icon } from 'antd';
import { connect } from 'react-redux'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar'

require('./sellerSet.less');

const FormItem = Form.Item;
const createForm = Form.create;

class IndexPage extends React.Component {
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="setSeller">
        <LeftBar />
        <Form onSubmit={this.handleSubmit}>
          <FormItem label="手机号">
            {getFieldDecorator('userName', {
              rules: [
                { required: true, message: '请输入用户名/手机号' },
                { pattern: /^1(3|4|5|7|8)\d{9}$/, message: '请输入正确的手机号码'}
              ],
            })(
              <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} readOnly/>
            )}
          </FormItem>
          <FormItem label="姓名">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '请输入姓名' },
                { pattern: /^1(3|4|5|7|8)\d{9}$/, message: '请输入正确的手机号码'}
              ],
            })(
              <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} readOnly/>
            )}
          </FormItem>
          <FormItem label="年龄">
            {getFieldDecorator('age', {
              rules: [
                { pattern: /[1-9]{1,}/, message: '请输入有效年龄'}
              ],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem>
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
