import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import '@fontsource-variable/figtree';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Honeybadger, HoneybadgerErrorBoundary } from "@honeybadger-io/react";
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import theme from './theme';

const {REACT_APP_HOST_URL} = process.env;

const config = {
  apiKey: "apikey",
  environment: REACT_APP_HOST_URL === 'http://localhost:3000' ? "development" : "production",
  report_data: false

}

const honeybadger = Honeybadger.configure(config)
const root = ReactDOM.createRoot(document.getElementById('root'));

function ForceDarkMode(props) {
    const { colorMode, toggleColorMode } = useColorMode();

    useEffect(() => {
        if (colorMode === 'light') return;
        toggleColorMode();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [colorMode]);

    return props.children;
}

root.render(
    <HoneybadgerErrorBoundary honeybadger={honeybadger}>
    <ChakraProvider theme={theme}>
            <ErrorBoundary>
            <ForceDarkMode>
                <React.StrictMode>
                    <App />
                </React.StrictMode>
            </ForceDarkMode>
    </ErrorBoundary>
        </ChakraProvider>
    </HoneybadgerErrorBoundary>

);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
