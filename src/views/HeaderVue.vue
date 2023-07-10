<template>
  <div class="header">
    <img src="../assets/icons/switchMode.png" alt="">

    <div class="header__mid">
      <div class="header__decks">Мои колоды</div>
      <img src="../assets/logo.png" alt="">
      <div class="header__create" @click="toggleCreate">Создать колоду</div>
    </div>

    <img class="logout" src="../assets/icons/user.png" alt="" @click="logout">

  </div>
</template>


<script>
import { defineComponent } from 'vue';
import { API_URL } from '@/api.js';
import axios from 'axios';
import router from "@/router";

export default defineComponent({
  props: {
    isCreate: {
      type: Boolean
    },
  },

  methods: {
    toggleCreate() {
      this.$emit("update-is-create", !this.isCreate);
    },
    logout () {
      const url = API_URL + 'logout/'
      try {
        axios.post(url)
        localStorage.clear();
        router.push('/login')
      } catch (error) {
        console.log(error);
      }
    }
  }
})
</script>  
<style>
.logout{
  cursor: pointer;
}
.header{
  margin-top: 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 35px;
}
.header__mid{
  display: flex;
  align-items: center;
  gap: 55px;
}
.header__decks{
  font-weight: 400;
  font-size: 24px;
  line-height: 29px;
  color: #1B1B1B;
  cursor: pointer;
  user-select: none;
}

.header__create{
  font-weight: 400;
  font-size: 24px;
  line-height: 29px;
  cursor: pointer;
  color: #1B1B1B;
  user-select: none;
}
</style>