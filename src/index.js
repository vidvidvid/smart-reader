import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider, useColorMode } from '@chakra-ui/react';

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
  <ChakraProvider>
    <ForceDarkMode>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ForceDarkMode>
  </ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
