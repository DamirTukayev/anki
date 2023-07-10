<template>
  <div class="header">
    <img src="../assets/icons/switchMode.png" alt="">

    <div class="header__mid">
      <div class="header__decks" @click="back">Мои колоды</div>
      <img src="../assets/logo.png" alt="">
      <div class="header__create" @click="isCreate = true">Создать карту</div>
    </div>

    <img class="logout" src="../assets/icons/user.png" alt="" @click="logout">

  </div>
  <div v-if="!cards.length">
    <p>На сегодня карточки закончились. Вы можете создать новую.</p>
    <button class="icon-btn" @click="isCreate = true" style="color:blue">Создать</button>
  </div>
  <div v-else>
    <div class="cards__actions cards__crud">
      <button class="icon-btn" @click="isCreate = true"><img src="../assets/icons/card/create.svg" alt=""></button>
      <button class="icon-btn" @click="isEdit = true"><img src="../assets/icons/card/edit.svg" alt=""></button>
      <button class="icon-btn" @click="isDelete = true"><img src="../assets/icons/card/delete.svg" alt=""></button>
    </div>
    <div class="cards">
      <div class="card" @click="isFront = !isFront">
        <p>
          {{isFront ? selectCard?.front : selectCard?.back}}
        </p>
        <div v-if="selectCard.image_url && showImage">
          <img class="card__img" :src="selectCard.image_url" alt="" v-show="showImage">
        </div>
        <div v-else-if="showImage">
          <div class="card__img">Нет изображения</div>
        </div>
        <button class="icon-btn show-image" @click.stop="showImage = !showImage"><img src="../assets/icons/card/img.svg" alt=""></button>
      </div>
      
    </div>

    <button class="cards__next icon-btn" @click="nextCard()"><img src="../assets/icons/card/next.svg" alt=""></button>

    <div class="cards__actions cards__points">
      <button @click="sendMark(5)">Отлично</button>
      <button @click="sendMark(4)">Хорошо</button>
      <button @click="sendMark(3)">Удовлетворительно</button>
      <button @click="sendMark(2)">Плохо</button>
      <button @click="nextCard()">Не изучено</button>
    </div>


  </div>
  <div class="dialog" v-if="isCreate">
    <div class="dialog__title">Создание карточки</div>
    <input type="text" placeholder="Термин" v-model="frontText">
    <input type="text" placeholder="Определение" v-model="backText">
    <img v-if="imageDataUrl" :src="imageDataUrl" alt="" class="dialog__img">
    <label for="file" class="dialog__label">
      <div class="dialog__text">Добавить фото</div>
      <input type="file"  id="file" class="dialog__file"  @change="handleFileInput">
    </label>
    <div class="dialog__actions">
      <button @click="createCard">Создать</button>
      <button @click="isCreate = false">Закрыть</button>
    </div>
  </div>

  <div class="dialog" v-if="isEdit && selectCard">
    <div class="dialog__title">Редактирование карточки</div>
    <input type="text" placeholder="Термин" v-model="selectCard.front" class="dialog__text">
    <input type="text" placeholder="Определение" v-model="selectCard.back" class="dialog__text">
    <img :src="selectCard.image_url" alt="" v-if="selectCard.image_url" class="dialog__img">
    <label for="file" class="dialog__label">
      <div class="dialog__text">Добавить фото</div>
      <input type="file"  id="file" class="dialog__file"  @change="handleFileInput">
    </label>
    <div class="dialog__actions">
      <button @click="editCard">Сохранить</button>
      <button @click="isEdit = false">Закрыть</button>
    </div>
  </div>
  <div class="dialog" v-if="isDelete && selectCard">
    <div class="dialog__title">Вы действительно хотите удалить карточку <strong>{{ selectCard?.front }}</strong></div>
    <div class="dialog__actions">
      <button @click="deleteCard">Да</button>
      <button @click="isDelete = false">Нет</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { API_URL } from '@/api.js';
import axios from 'axios';


    const step = ref(0)
    const isFront = ref(true)
    const showImage = ref(false)
    const selectedCards = ref([])
    

    const store = useStore()
    const router = useRouter()
    
    const cards = computed({
      get() {
        const cards = store.state.appStore.selectedCards
        if (selectedCards.value.length > 0) {
          return selectedCards.value
        }
        if (cards) {
          return cards
        }
        return []
      },
      set(value) {
        selectedCards.value = value
        store.dispatch('SET_VALUE', { key: 'selectedCards', value })
      },
    })

    const selectCard = computed(() => {
      return cards.value[step.value]
    })

    function back() {
      router.push('/')
    }

    function logout () {
      const url = API_URL + 'logout/'
      try {
        axios.post(url)
        localStorage.clear();
        router.push('/login')
      } catch (error) {
        console.log(error);
      }
    }

    function nextCard() {
      isFront.value = true
      if (step.value < cards.value.length - 1) {
        step.value++
      } else {
        step.value = 0
      }
    }

    async function sendMark(mark) {
      const url = API_URL + 'user/answer/' + selectCard.value.id
      const data = {
        mark: mark
      }
      try {
        await axios.post(url, data)
        removeCard(selectCard.value)
        nextCard()
      } catch (error) {
        console.log(error);
      }
    }
    function removeCard(selectCard) {
      const index = cards.value.indexOf(selectCard)
      if (index !== -1) {
        cards.value.splice(index, 1);
        if (!cards.value.length) {
          cards.value = []
        }
      }  
    }

    const isCreate = ref(false)
    const frontText = ref('')
    const backText = ref('')
    const file = ref(null)
    const imageDataUrl = ref(null)

    const handleFileInput = (event) => {
      const uploadedFile = event.target.files[0]
      file.value = uploadedFile
      const reader = new FileReader();
      reader.readAsDataURL(uploadedFile);
      reader.onload = () => {
        imageDataUrl.value = reader.result;
      };
    }

    const createCard = async () => {
      const deckId = store.state.appStore.selectedDeckId

      const url = API_URL + 'cards/'

      const data = new FormData
      data.append("front", frontText.value);
      data.append("back", backText.value);
      data.append("deck_id", deckId);
      if (file.value) {
        data.append("image", file.value);
      }
      try {
        const resp = await axios.post(url, data)
        selectedCards.value = [...cards.value, resp.data]

        frontText.value = ''
        backText.value = ''
        file.value = null
        imageDataUrl.value = null

        isCreate.value = false
      } catch (error) {
        console.log(error)
      }
    }

    const isEdit = ref(false)

    const editCard = async () => {
      const cardId = selectCard.value.id

      const url = API_URL + 'card/' + cardId + '/'

      const data = new FormData
      data.append("front", selectCard.value.front);
      data.append("back", selectCard.value.back);
      if (file.value) {
        data.append("image", file.value);
      }
      try {
        const resp = await axios.patch(url, data)
        console.log(resp);
        selectCard.value.image_url = resp.data.image_url
        isEdit.value = false
      } catch (error) {
        console.log(error)
      }
    }

    const isDelete = ref(false)
    const deleteCard = async () => {
      const cardId = selectCard.value.id
      const url = API_URL + 'card/' + cardId + '/'
      try {
        await axios.delete(url)
        removeCard(selectCard.value)
        nextCard()
        isDelete.value = false
      } catch (error) {
        console.log(error);
      }
    }
</script>


<style scoped>
.cards{
  margin: 30px 0;
  width: 100%;
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  user-select: none;
  cursor: pointer;
  font-size: 40px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
}
.card__img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  background-color: rgb(255, 255, 255);
  max-width: 300px;
  max-height: 300px;
}

.show-image {
  position: absolute;
  right: 30px;
  top: 30px;
  z-index: 1;
}

.cards__actions{
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 40px;
}
.cards__next{
  display: flex;
  margin: 0 auto;
  margin-bottom: 20px;
}
.dialog{
  position: fixed;
  width: 300px;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  border-radius: 20px;
  padding: 25px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  border-radius: 20px;
}
.dialog input {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  width: 100%;
  height: 30px;
  padding: 0 10px;
  outline: 0;
}
.dialog__title{
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
  margin-bottom: 10px;
}
.dialog__text {
  outline: 0;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  width: 100%;
  height: 30px;
  margin-bottom: 10px;
  padding: 0 10px;
  font-size: 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.dialog__file{
  display: none;
}
.dialog__actions{
  display: flex;
  gap: 20px;
  margin-top: 20px;
  width: 100%;
}
.dialog__actions button {
  height: 40px;
  width: 50%;
  border: none;
  font-size: 16px;
  border-radius: 10px;
  background: #FFAC2F;
  cursor: pointer;
  padding: 10px;
}
.dialog__img{
  width: 200px;
}
.icon-btn{
  border: none;
  background: transparent;
  cursor: pointer;
  outline: 0;
}
.cards__crud{
  justify-content: flex-end;
  border-top: 1px solid #C4C4C4;
  padding-top: 15px;
}

.cards__points button{
  font-weight: 400;
  font-size: 16px;
  line-height: 20px;
  color: #000000;
  background: #FFFFFF;
  border: 1px solid rgba(0, 0, 0, 0.25);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>