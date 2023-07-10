<template>
  <HeaderVue :isCreate="isCreate" @update-is-create="updateIsCreate"/>
  <div class="home">
    <div v-if="loading">
      Загрузка......
    </div>
    <div  v-else>
      <div class="home__decks">Мои колоды</div>
      <button class="btn-create-deck form__button" @click="isCreate = !isCreate">{{ isCreate ? 'Закрыть окно' : 'Создать колоду'}}</button>
      <div class="deck deck-create" v-show="isCreate">
        <div class="deck-create-title">
          Создание колоды
        </div>
        <label for="name">Название колоды:</label>
        <input 
          id="name" 
          type="text" 
          v-model="name"
        >

        <label for="description">Описание колоды:</label>
        <textarea 
          id="description" 
          type="text" 
          v-model="description"
          class="deck-create-last"
        ></textarea>

        <div class="deck__actions">
          <button @click="createDeck">Создать</button>
          <button @click="isCreate = false">Закрыть</button>
        </div>
        
      </div>
      <div class="cards">
        <div class="deck" v-for="(deck, index) in decks" :key="index" @click="selectCard(deck)">
          <div class="deck-title">{{ deck.title }}</div>
          <p>Количество карточек: {{ deck.cards.length }}</p>
          <p>Количество неизученных карточек: {{ activeCards(deck.cards) }}</p>
          <p>Описание карточки: {{ deck.description }}</p>

          <div class="deck__btns">
            <div class="deck__btns__wrap">
              <img src="../assets/icons/edit.png" alt="" @click.stop="editDeck(deck)">
              <img src="../assets/icons/delete.png" alt="" @click.stop="deleteDeck(deck)">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="dialog deck-create deck" v-show="isEditDeck">
    <div class="deck-create-title">
      Редактирование колоды
    </div>
    <label for="name">Новое название колоды:</label>
    <input 
      id="name" 
      type="text" 
      v-model="deckForEdit.title"
    >

    <label for="description">Новое описание колоды:</label>
    <textarea 
      id="description" 
      type="text" 
      v-model="deckForEdit.description"
      class="deck-create-last"
    ></textarea>

    <div class="deck__actions">
      <button @click="saveDeck(deckForEdit)">Сохранить</button>
      <button @click="isEditDeck = false">Закрыть</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { API_URL } from '@/api.js';
import axios from 'axios';
import { useStore } from 'vuex'
import router from "@/router";

import HeaderVue from '../views/HeaderVue.vue'

    const store = useStore()

    const decks = ref([])
    const loading = ref(true)
    const isCreate = ref(false)

    const name = ref('')
    const description = ref('')

    const updateIsCreate = (newValue) => {
      isCreate.value = newValue;
    }

    onMounted(async () => {
      await getAllDecks()
    });

    const getAllDecks = async () => {
      try {
        const resp = await axios.get(API_URL + 'user/decks')
        decks.value = resp.data
        loading.value = false
      } catch (error) {
        console.log(error);
      }
    }

    const selectCard = (deck) => {
      const fiteredCards = deck.cards.filter(item => item !== null)
      store.dispatch('SET_VALUE', 
      { 
        key: 'selectedCards', 
        value: fiteredCards 
      });
      localStorage.setItem('ankiSelectedCards', JSON.stringify(fiteredCards));

      store.dispatch('SET_VALUE', 
      { 
        key: 'selectedDeckId', 
        value: deck.id 
      });
      localStorage.setItem('ankiDeckId', JSON.stringify(deck.id));
      router.push('/cards')
    }

    const createDeck = async () => {
      const url = API_URL + 'decks/'

      const data = {
        title: name.value,
        description: description.value,
      }
      try {
        loading.value = true
        await axios.post(url, data)

        await getAllDecks()

        name.value = ''
        description.value = ''
        loading.value = false
        isCreate.value = false
      } catch (error) {
        console.log(error);
      }
    }

    const deleteDeck = async (deck) => {
      const url = API_URL + 'deck/' + deck.id

      try {
        await axios.delete(url)

        await getAllDecks()
        loading.value = false
      } catch (error) {
        console.log(error);
      }
    }

    const deckForEdit = ref({})
    const isEditDeck = ref(false)

    const editDeck = async (deck) => {
      deckForEdit.value = deck
      isEditDeck.value = true
    }

    const activeCards = (cards) => cards.filter(item => item !== null).length;

    const saveDeck = async (deck) => {
      const url = API_URL + 'deck/' + deck.id + '/'
      const data = {
        title: deck.title,
        description: deck.description
      }
      try {
        await axios.patch(url, data)

        isEditDeck.value = false
      } catch (error) {
        console.log(error);
      }
    } 

</script>

<style scoped>
.cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.deck {
  cursor: pointer;
  width: calc(33% - 35px);
  margin-bottom: 20px;
  padding: 10px;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
  position: relative;
  padding-bottom: 20px;
}

.deck-create{
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.btn-create-deck{
  margin-bottom: 20px;
}
.deck h2 {
  font-size: 24px;
  margin-bottom: 10px;
}
.deck p {
  font-size: 16px;
  color: #555;
  margin-bottom: 25px;
}

.home__decks{
  font-weight: 400;
  font-size: 24px;
  line-height: 29px;
  color: #1B1B1B;
  display: flex;
  justify-content: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #C4C4C4;
  margin-bottom: 36px;
}
.deck-title{
  font-weight: 500;
  font-size: 24px;
  line-height: 29px;
  color: #1B1B1B;
  padding-bottom: 5px;
  border-bottom: 1px solid #29ABE2;
  margin-bottom: 25px;
}
.deck-create-title{
  font-weight: 500;
  font-size: 24px;
  line-height: 29px;
  color: #1B1B1B;
  padding-bottom: 5px;
  border-bottom: 1px solid #C3C3C3;
  margin-bottom: 10px;
}

.deck-create label {
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: #1B1B1B;
  margin-bottom: 10px;
} 
.deck-create input {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  min-height: 30px;
  margin-bottom: 10px;
  outline: 0;
  padding: 0 20px;
  max-width: 60%;
}

.deck-create textarea {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  min-height: 100px;
  max-height: 120px;
  margin-bottom: 10px;
  outline: 0;
  padding: 10px 20px;
  max-width: 60%;
  min-width: 60%;
}

.form__button {
  background: #FFAC2F;
  border-radius: 20px;
  width: 200px;
  border: none;
  height: 50px;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  color: #222222;
  margin-bottom: 20px;
  cursor: pointer;
}

.deck__actions{
  display: flex;
  gap: 30px;
}
.deck__actions button {
  border: none;
  background-color: #FFAC2F;
  border-radius: 20px;
  padding: 10px 20px;
  cursor: pointer;
}

.deck__btns{
  position: absolute;
  right: 20px;
  bottom: 10px;
}
.deck__btns__wrap{
  display: flex;
  gap: 15px;
}

.dialog{
  position: fixed;
  width: 600px;
  height: 400px;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
}
</style>
