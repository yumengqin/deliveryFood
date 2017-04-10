import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import Home from './pages/home/index.js'
import LoginContainer from './pages/auth/index.js'
import IndexContainer from './pages/index/index.js'
import createSocketMiddleware from './redux_middleware'
import io from 'socket.io-client'
import reducers from './reducer'
import './index.less';

var socket = io();
var socketMiddleware = createSocketMiddleware(socket);

var store = createStore(reducers, applyMiddleware(socketMiddleware));

render(
  <Provider store={store}>
    <Router history={hashHistory} >
      <Route path='/' component={Home}/>
      <Route path='/login' component={LoginContainer}/>
      <Route path='/index' component={IndexContainer}/>
    </Router>
  </Provider>
  ,
  document.getElementById('test'));
