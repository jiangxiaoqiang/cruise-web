import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import { Provider } from 'react-redux';
import reportWebVitals from './reportWebVitals';
import store from './store';
import 'lib-flexible';
import routes from './routes/routes';
import { RouterProvider } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={routes} />
    </Provider>
  </React.StrictMode>,
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();