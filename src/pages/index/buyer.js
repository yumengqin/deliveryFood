import React from 'react';
import { connect } from 'react-redux'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import Home from '../../components/header'

class IndexPage extends React.Component {
  render() {
    return (
      <div>
        <Home />
      </div>
    );
  }
}

export default IndexPage;
