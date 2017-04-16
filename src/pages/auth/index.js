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
      fetch('/api/auth', {
        method: 'GET',
        credentials: 'include'
      }).then(function(res) {
        return res.json()
      }).then(function(data) {
        //如果有cookie，证明已经登录，无需再次登录
        if (data.permit) {
          hashHistory.push('/');
        }
      })
    }
  }
}

var LoginPage = connect(mapStateToProps, mapDispatchToProps)(Login);

export default LoginPage
