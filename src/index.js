import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { App as AppAntd } from "antd";
import { ConfigProvider } from "antd";
import { antdThemeConfig } from './antd-theme';
import reportWebVitals from './reportWebVitals';
import { sendToVercelAnalytics } from './vitals';

ReactDOM.render(
    <React.StrictMode>
        <ConfigProvider theme={antdThemeConfig}>
            <AppAntd>
                <App />
            </AppAntd>
        </ConfigProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

reportWebVitals(sendToVercelAnalytics);
