import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import store from './store'
import Vuex from 'vuex'

const app = createApp(App)

app.use(store)
app.use(router)
app.use(Vuex)


axios.interceptors.request.use(
  function (config) {
    // перехватчик запросов. Добавляет заголовок авторизации
    const whiteList = ['/config.json', '/token', '/register']; // список запросов для которых не нужен токен
    let inWhiteList = false;
    whiteList.forEach((urlFromWhite) => {
      if (~config.url.indexOf(urlFromWhite)) {
        inWhiteList = true;
      }
    });
    if (inWhiteList) {
      return config;
    }
    const accessToken = localStorage.getItem('ankiAccessToken');
    if (accessToken) {
      config.headers.Authorization = 'Bearer ' + accessToken;
    } else {
      router.push('/login');
      throw new axios.Cancel('Cancel request. No access token');
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

async function checkAuth() {
  const refreshToken = localStorage.getItem('ankiRefreshToken');
  const url = 'https://marquislim2.pythonanywhere.com/api/token/refresh/'

  if (!refreshToken || refreshToken === 'null' || refreshToken === null) {
    router.push('/login')
    return;
  }
  try {
    const resp = await axios.post(url, { refresh: refreshToken });
    localStorage.setItem('ankiAccessToken', resp.data.access);
    store.dispatch('SET_VALUE', { key: 'isAuthorized', value: true });
  } catch (error) {
    console.info('fail update token', error);
    router.push('/login')
  }
}

app.config.productionTip = false;

async function ititApp () {
  await checkAuth()
  app.mount('#app')
}

ititApp()
