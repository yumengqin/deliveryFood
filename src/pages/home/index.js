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
      
    }
  }
}

var HomePage = connect(mapStateToProps, mapDispatchToProps)(Home);

export default HomePage
