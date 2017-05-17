import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import { Form, Button, message, Input, Icon, Select, Upload } from 'antd';
import { connect } from 'react-redux'
import moment from 'moment'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar'
import { toDate, toTime } from '../../utils/number'


const FormItem = Form.Item;
const createForm = Form.create;
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
      img: ''
    }
  }
  componentWillMount() {
    var _this = this;
    fetch('/api/menu/show', {
      method: 'post',
      body: JSON.stringify({
        id : this.props.params.id,
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.props.form.setFieldsValue({
        ...res.data,
      });
      _this.setState({ data: res.data, img: res.data.img });
    });
    fetch('/api/store', {
      method: 'post',
      body: JSON.stringify({
        userName : sessionStorage.getItem('userName'),
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ store: res.data });
    })
  }
  handleSubmit(e) {
    console.log('111')
    e.preventDefault();
    const _this = this;
    this.props.form.validateFieldsAndScroll((err, data) => {
      if (err) {
        console.log(err);
        return 0;
      }
      const menu = {
          id: this.state.data.id,
          owner: this.state.data.owner,
          menuName: data.menuName,
          type: data.type,
          intro: data.intro,
          price: data.price,
          boxPrice: data.boxPrice,
          img: this.state.img,
      };
      fetch('/api/menu/update', {
        method: 'post',
        body: JSON.stringify(menu),
        credentials: 'include'
      }).then(function(res) {
        return res.json();
      }).then(function(res) {
        hashHistory.push('/setMenu');
      })
    });
  }
  delete() {
    fetch('/api/menu/delete', {
      method: 'post',
      body: JSON.stringify({ id: this.props.params.id }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      hashHistory.push('/setMenu');
    })
  }
  uploadMenuImg({ file }) {
    if (file.status === 'done') {
      this.setState({ img: file.response.imgUrl });
    }
  }
  renderSelect() {
    if (this.state.store && this.state.store.typeMenu && this.state.store.typeMenu.length !== 0) {
      return (this.state.store.typeMenu).map((item, index) => {
        return <Option value={item} key={index}>{item}</Option>;
      });
    } else {
      return <Option value="全部" key="all">全部</Option>;
    }
    // (this.state.data && this.state.data.menuType ? this.state.data.menuType : []).map((item, index) => {
    //   <Option value={item} key={index}>{item}</Option>
    // })
  }
  returnPage() {
    hashHistory.push('/setMenu');
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div className="setSeller setMenu">
        <LeftBar />
        <div className="rightMenu newMenu">
          <h1>编辑菜品</h1>
          <Form onSubmit={e => this.handleSubmit(e)}>
            <FormItem label="菜品名称">
              {getFieldDecorator('menuName', {
                rules: [
                  { required: true, message: '请输入菜品名称' },
                ],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="菜品所属分类">
              {getFieldDecorator('type', {
                rules: [],
              })(
                <Select placeholder="请选择菜品所属的分类">
                  { this.renderSelect() }
                </Select>
              )}
            </FormItem>
            <FormItem label="菜品描述">
              {getFieldDecorator('intro', {
                rules: [
                  { max: 50, message: '请输入50字以内的描述' },
                ],
              })(
                <Input />
              )}
            </FormItem>
            <FormItem label="单价">
              {getFieldDecorator('price', {
                rules: [
                  { required: true, message: '请输入菜品单价' },
                  { type: 'number', transform: toNumber, message: '请输入数字' },
                ],
              })(
                <Input placeholder="0.00" prefix={<Icon type="pay-circle" style={{ fontSize: 16 }} />} />
              )}
            </FormItem>
            <FormItem label="餐盒费">
              {getFieldDecorator('boxPrice', {
                rules: [
                  { required: true, message: '请输入餐盒费' },
                  { type: 'number', transform: toNumber, message: '请输入数字' },
                ],
              })(
                <Input placeholder="0.00" prefix={<Icon type="pay-circle" style={{ fontSize: 16 }} />} />
              )}
            </FormItem>
            <FormItem label="上传图片">
              <Upload
                className="avatar-uploader"
                name='uploadFile'
                showUploadList={false}
                action="http://localhost:5000/api/menuImg/upload"
                onChange={file => this.uploadMenuImg(file)}
              >
                {
                  this.state.img ?
                    <img src={this.state.img} alt="" className="avatar" /> :
                    <Icon type="plus" className="avatar-uploader-trigger" />
                }
              </Upload>
            </FormItem>
            <FormItem className="allRow btnItem">
              <Button type="primary" htmlType="submit">保存</Button>
              <Button type="danger" onClick={() => this.delete()}>删除</Button>
              <Button type="primary" onClick={() => this.returnPage()}>取消</Button>
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}

IndexPage.propTypes = {
  form: PropTypes.shape(),
  params: PropTypes.shape(),
};

export default connect()(createForm()(IndexPage));
