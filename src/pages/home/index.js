import { connect } from 'react-redux'
import Home from '../../components/home'
import { message_update, guest_update, nickname_get } from '../../action'
import { hashHistory } from 'react-router'

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
        console.log(data);
        //如果有cookie，证明已经登录，无需再次登录
        if (data.permit) {
          hashHistory.push('/index');
        }
      })
    }
  }
}

var HomePage = connect(mapStateToProps, mapDispatchToProps)(Home);

export default HomePage
