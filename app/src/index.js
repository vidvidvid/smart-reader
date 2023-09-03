import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import '@fontsource-variable/figtree';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Honeybadger, HoneybadgerErrorBoundary } from "@honeybadger-io/react"

import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import theme from './theme';

const config = {
  apiKey: "apikey",
  environment: "production"
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
    <ForceDarkMode>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ForceDarkMode>
        </ChakraProvider>
        </HoneybadgerErrorBoundary>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
