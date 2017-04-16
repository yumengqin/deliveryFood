import React from 'react';
import { connect } from 'react-redux'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'

class IndexPage extends React.Component {
  render() {
    return (
      <div>进入页面</div>
    );
  }
}

export default IndexPage;
