import React, { PropTypes } from 'react';
import { Upload, Icon, Modal } from 'antd';

class PicturesWall extends React.Component {
  constructor(props, context) {
    super(props, context);
    // console.log(this.props.fileList);
    this.state = {
      previewVisible: false,
      previewImage: '',
      fileList: this.getFileList(this.props.fileList),
    };
  }
  componentWillReceiveProps(nextprops) {
    this.setState({ fileList: this.getFileList(nextprops.fileList) });
  }

  getFileList(arr) {
    // console.log(arr);
    const result = [];
    (arr || []).map((item, index) => {
      result.push({ uid: index, name: '', status: 'done', url: item.url ? item.url : (item.status ? (item.response ? item.response.imgUrl : '') : item) });
    });
    return result;
  }
  handleCancel() {
    this.setState({ previewVisible: false });
  }

  handlePreview(file) {
    this.setState({
      previewImage: file.url || file.response.imgUrl,
      previewVisible: true,
    });
  }

  handleChange({fileList}) {
      this.props.app.setState({ fileList: fileList });
      this.setState({ fileList });
  }

  handleRemove(fileList) {
    this.props.app.setState({ fileList: fileList });
    this.setState({ fileList });
  }
  render() {
    const { previewVisible, previewImage, fileList } = this.state;
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    return (
      <div className="clearfix">
        <Upload
          name='uploadFile'
          action='http://localhost:5000/api/storeImg/upload'
          listType="picture-card"
          fileList={fileList}
          onRemove={file => this.handleRemove(file)}
          onPreview={file => this.handlePreview(file)}
          onChange={file => this.handleChange(file)}
        >
          {fileList.length >= 3 ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={() => this.handleCancel()}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    );
  }
}
PicturesWall.propTypes={
  app: PropTypes.shape(),
  fileList: PropTypes.any,
}

export default PicturesWall;
