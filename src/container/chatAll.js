import { connect } from 'react-redux'
import ChatAll from '../components/chatall'
import { message_update, guest_update, nickname_get, nickname_forget } from '../action'
import { hashHistory } from 'react-router'

var mapStateToProps = (state, ownProps) => {
  return {
    nickName: state.nickName,
    nameList: state.nameList,
    msgList: state.msgList
  }
}

var mapDispatchToProps = (dispatch, ownProps) => {
  return {
    handleClick: function(e) {
      fetch('/api/logout', {
        method: 'POST',
        body: '',
        credentials: 'include'
      }).then(function(res) {
        if (res.ok) {
          hashHistory.push('/login');
          dispatch(nickname_forget());
        }
      });
    },
    handleSubmit: function(value, nickName) {
      dispatch(message_update({
        nickName: nickName,
        msg: value
      }));
    },
    checkLogin: function() {
      // dispatch(nickname_get(''));
    }
  }
}

var ChatAllContainer = connect(mapStateToProps, mapDispatchToProps)(ChatAll);
export default ChatAllContainer
