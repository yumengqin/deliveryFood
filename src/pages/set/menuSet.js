import React, { PropTypes } from 'react';
import { Form, Button, DatePicker, message, Spin, Input, Icon, Radio } from 'antd';
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


class IndexPage extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  componentWillMount() {

  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="setSeller">
        <LeftBar />
        <h1>店铺名字</h1>
        <div></div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  form: PropTypes.shape(),
};

export default createForm()(IndexPage);
