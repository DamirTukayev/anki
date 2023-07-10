<template>
  <!-- <div id="nav">
    <button @click="typePage = 'auth'">Auth</button> | 
    <button @click="typePage = 'reg'">Registration</button>
  </div> -->
  <div class="form__block">
    <div class="form">
      <img class="form__img" src="../assets/logo.png" alt="">

      <label class="form__label" for="login">Логин</label>
      <input placeholder="Логин" class="form__input" id="login" v-model="login" required>
      
      <label class="form__label" for="password">Пароль</label>
      <input placeholder="Пароль" class="form__input" id="password" v-model="password" type="password" required>
      
      <button class="form__button" type="submit" @click="handleSubmit">Войти</button>
      <button class="form__button-registration" type="submit" @click="registration">Регистрация</button>

    </div>
  </div>
  
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios'
import router from "@/router";
import jwt_decode from "jwt-decode";

  const login = ref('');
  const password = ref('');

  const registration = async () => {
    const urlReg = 'https://marquislim2.pythonanywhere.com/api/v1/register/'
    const data = {
      username: login.value,
      password: password.value,
    }
    try {
      await axios.post(urlReg, data)
      await handleSubmit()
    } catch (error) {
      console.log(error);
    }

  }
  const handleSubmit = async () => {
    const url = 'https://marquislim2.pythonanywhere.com/api/token/'

    const data = {
      username: login.value,
      password: password.value,
    }
    try {
      const resp = await axios.post(url, data)
      localStorage.setItem('ankiAccessToken', resp.data.access);
      localStorage.setItem('ankiRefreshToken', resp.data.refresh);
      const decoded = jwt_decode(resp.data.access)
      localStorage.setItem('decodedToken', JSON.stringify(decoded));
      router.push('/')
    } catch (error) {
      console.log(error);
      console.log('Не удалось войти');
    }
  };


</script>

<style>
.form__block{
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 475px;
  padding: 25px 90px;
  background: #D9D9D9;
  border-radius: 20px;
  padding-top: 130px;
  position: relative;
}

.form__label {
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
  margin-bottom: 10px;
}

.form__input {
  width: 100%;
  font-size: 16px;
  margin-bottom: 30px;
  border: none;
  background: #FFFFFF;
  border-radius: 20px;
  height: 50px;
  outline: 0;
  padding: 0 20px;
  color: rgb(62, 62, 62);
}

.form__button {
  background: #FFAC2F;
  border-radius: 20px;
  width: 100%;
  border: none;
  height: 50px;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #222222;
  margin-bottom: 20px;
  cursor: pointer;
}

.form__button-registration{
  background: #29ABE2;
  border-radius: 20px;
  width: 100%;
  border: none;
  height: 50px;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #FFFFFF;
  cursor: pointer;
}
.form__img{
  position: absolute;
  top: -150px;
}
</style>
