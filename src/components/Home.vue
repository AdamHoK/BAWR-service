<script setup lang="js">

  import SeatingChart from './SeatingChart.vue';
  import PaymentPage from './PaymentPage.vue';
  import SeatingChartInput from './SeatingChartInput.vue';

  import { storeToRefs } from 'pinia'
  import {useSelectedSeatsStore} from '../stores/selectedSeats';
    
  const selectedSeatsStore = useSelectedSeatsStore();
  const { onPaymentStage } = storeToRefs(selectedSeatsStore)


  function returnToSeatingChart(){
    selectedSeatsStore.setPaymentStage(false)
  }

</script>

<template>
    <div class="main-wrapper main-container">
        <div class="hero-section">
          <div v-if="onPaymentStage" @click="returnToSeatingChart" class="return-button">
            <i class="pi pi-arrow-left"></i>
          </div>
          <div class="logo">
              <img src="../assets/wab-logo.jpg" alt="logo" />
          </div>
          <LanguageSwitcher></LanguageSwitcher>
        </div>

        <div v-if="!onPaymentStage" class="main-container flex justify-center" id="SeatingSelection">
            
            <SeatingChart></SeatingChart>
            <SeatingChartInput></SeatingChartInput>
        </div>
        <div v-if="onPaymentStage" class="main-container flex justify-center">
          <PaymentPage></PaymentPage>
        </div>
    </div>
</template>

<style scoped lang="scss">
  @import "../assets/variables";
  :focus,
  :focus-visible {
      outline: none;
      box-shadow: 0 0 0 2px #1e2226, 0 0 0 4px #41b88395, 0 1px 2px 0 black;
  }

  a {
      cursor: pointer;
  }

  .main-container {
      max-width: 1448px;
      margin: 0 auto;
      padding: 0rem 1rem 3rem;
  }

  .hero-section .logo {

    display: flex;
    justify-content: flex-end;
    align-items: flex-end;

      img {
        max-width: 10vw;
        width: 100%;
      }
  }

  .form-input-wrapper {
    margin: 15px 0;
    display: flex;
    flex-direction: column;
  }

  .p-error {
    display: block;
    color: red;
  }

  .form-wrapper {
    display: flex;
    flex-direction: column;
    justify-self: center;
    align-items: center;
    max-width: 766px;
    margin: 0 auto;

    .form-input-wrapper {
      width: 100%;
    }
  }

  .selected-info {
        display: flex;
        justify-content: flex-start;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        transition: all ease-in-out .2s;
        max-width: 766px;
        margin: 10px auto;

        &__heading {
            color: var(--p-floatlabel-focus-color);
            font-size: 12px;
            padding-left: .75em;
        }
        
        &__wrapper {
            display: flex;
            flex-direction: row;
            gap: 1em;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
        }

        &__input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1em;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 1em;
          
        }

        &__radio-input{
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          white-space: nowrap;
        }
    }


    .hero-section {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      .return-button {
        i {
          color: $stone;
          font-size: 2rem;
        }
        &:hover {
          cursor: pointer;
        }
      }
    }


</style>