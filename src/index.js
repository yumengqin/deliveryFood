import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import Home from './pages/home/index.js'
import LoginContainer from './pages/auth/index.js'
import SignupContainer from './pages/auth/signup.js'
import OpenContainer from './pages/auth/open.js'
import IndexBuyerContainer from './pages/index/buyer.js'
import setSellerContainer from './pages/seller/sellerSet.js'
import setStoreContainer from './pages/seller/storeSet.js'
import setMenuContainer from './pages/seller/menuSet.js'
import addMenuContainer from './pages/seller/addMenu.js'
import MenuInfoContainer from './pages/seller/editMenu.js'
import setBuyerContainer from './pages/buyer/buyerSet.js'
import storeContainer from './pages/store/index.js'
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
      <Route path='/signup' component={SignupContainer}/>
      <Route path='/open' component={OpenContainer} />
      <Route path='/indexBuyer' component={IndexBuyerContainer}/>
      <Route path='/setSeller' component={setSellerContainer} />
      <Route path='/setStore' component={setStoreContainer} />
      <Route path='/setMenu' component={setMenuContainer} />
      <Route path='/setMenu/addMenu' component={addMenuContainer} />
      <Route path='/setMenu/:id' component={MenuInfoContainer} />
      <Route path='/setBuyer' component={setBuyerContainer} />
      <Route path='/store/:id' component={storeContainer} />
    </Router>
  </Provider>
  ,
  document.getElementById('test'));
