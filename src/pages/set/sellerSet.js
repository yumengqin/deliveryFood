import React from 'react';
import { connect } from 'react-redux'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'
import LeftBar from '../../components/leftBar'



class IndexPage extends React.Component {
  render() {
    return (
      <div className="setSeller">
        <LeftBar />
      </div>
    );
  }
}

export default IndexPage;
