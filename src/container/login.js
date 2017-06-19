import { connect } from 'react-redux'
import Login from '../components/login'
import { message_update, guest_update, nickname_get } from '../action'
import { hashHistory } from 'react-router'

function mapStateToProps(state, ownProps) {
  return {
    nickName: state.nickName
  }
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    checkLogin: function() {
      
    },
    handleClick: function(e) {
      // var nickname = this.refs.nick.value;
      var nickname = '123';
      fetch('/api/nickname', {
        method: 'POST',
        body: nickname,
        credentials: 'include'
      }).then(function(res) {
        return res.json();
      }).then(function(data) {
        if (data.legal == 'yes') {
          dispatch(nickname_get(nickname));
          hashHistory.push('/');
        } else if (data.legal == 'repeat') {
          alert('昵称已被占用,请重新选择昵称！');
        } else if (data.legal == 'self login') {
          alert('您已进入聊天室,请勿重复进入');
        }
      })
    }
  }
}

var LoginContainer = connect(mapStateToProps, mapDispatchToProps)(Login);

export default LoginContainer
