import React, { PropTypes } from 'react';
import { connect } from 'react-redux'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import Home from '../../components/header'

class IndexPage extends React.Component {
  componentWillMount() {
    var _this = this;
    fetch('/api/store', {
      method: 'post',
      body: JSON.stringify({
        userName : _this.props.params.id,
      }),
      credentials: 'include'
    }).then(function(res) {
      return res.json();
    }).then(function(res) {
      _this.setState({ data: res.data });
    })
  }
  render() {
    return (
      <div>
        卖家
      </div>
    );
  }
}

IndexPage.propTypes = {
  form: PropTypes.shape(),
  params: PropTypes.shape(),
};

export default IndexPage;
