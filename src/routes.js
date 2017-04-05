import App from './index';
import login from './container/login.js';

// import { userIsAuthenticated, userHasPermission } from './utils/wrappers';

const routes = {
  path: '/',
  component: App,
  indexRoute: { components: { children: login } },
};

export default routes;
