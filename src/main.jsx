// Import Bootstrap CSS first
import "bootstrap/dist/css/bootstrap.min.css";

// Then import your Tailwind CSS
import "./index.css";


import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {BrowserRouter} from 'react-router-dom'
import { CookiesProvider } from 'react-cookie';

const defaultProps = {
  radio: {
    className: "!rounded-md text-purple-600", // example: make radios rectangular and purple
    color: "purple",
  },
};
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CookiesProvider>
    <BrowserRouter>
    <App />
    </BrowserRouter>
    </CookiesProvider>
  </React.StrictMode>,
)
