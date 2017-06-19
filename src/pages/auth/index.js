import React from 'react';
import { connect } from 'react-redux'
import Login from '../../components/login';
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'

require('./index.less');

function mapStateToProps(state, ownProps) {
  return {
    nickName: state.nickName
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    checkLogin: function() {
      console.log(111);
    }
  }
}

var LoginPage = connect(mapStateToProps, mapDispatchToProps)(Login);

export default LoginPage
