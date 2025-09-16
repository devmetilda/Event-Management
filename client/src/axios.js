// src/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL // automatically points to Render backend
});

export default instance;
