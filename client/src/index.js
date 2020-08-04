import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import configureStore from './configureStore';
import reducers from './reducers';
import './components/App/index.css';
import './i18n';

const { BUILD_ENVS } = require('../package.json');

const store = configureStore(reducers, {}); // set initial state

const render = () => {
    // eslint-disable-next-line global-require
    const App = require('./containers/App').default;
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        document.getElementById('root'),
    );
};

render();

const BUILD_ENV = BUILD_ENVS[process.env.BUILD_ENV];

const isDev = BUILD_ENV === BUILD_ENVS.dev;

if (isDev && module.hot) {
    module.hot.accept('./containers/App', render);
}
