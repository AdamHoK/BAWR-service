<script setup lang="js">
  import { useForm } from 'vee-validate';
  import { StripeCheckout } from '@vue-stripe/vue-stripe';
  import seatingChart from './seatingChart.vue';
  import { ref, onMounted } from 'vue';
  import * as yup from 'yup';
  import axios from 'axios'

  const NODE_URL = 'http://localhost:8080';

  const publishableKey = "pk_live_51PV02HRtieu1iWXNV7q59QGx1WNQ3fn6LPUAohDkZTfKKNGrdiJml9p1UThILfarkYQFyLTGu49M0cWJRtAgJlom00z2rnj5MB";
  const successURL = 'your_success_url';
  const cancelURL = 'your_error_url';
  const lineItems= [
        {
          price: 'your_price_id',
          quantity: 1,
        }
  ];

  const selectedSeats = ref([]);
  const formValues = {
    email: 'adam.hochschild@mail.com',
    fullName: 'adam hochschild',
  }

  const schema = yup.object({
    email: yup.string().required().email().label('Email address'),
    fullName: yup.string().required().label('Full name')
  });

  const { defineField, handleSubmit, resetForm, errors, meta } = useForm({
    initialValues: formValues,
    validationSchema: schema,
  });

  const [fullName] = defineField('fullName');
  const [email] = defineField('email');

  const onSubmit = handleSubmit((values) => {

    const cleanArr = JSON.parse(JSON.stringify(Array.from(selectedSeats.value)));
    console.log('Submitted with', {...values, selectedSeats: cleanArr });

    // submitReservation({...values, selectedSeats: cleanArr });
  });

  async function submitReservation(values) {
    const data = {
      email: values.email,
      full_name: values.fullName,
      seat_numbers: values.selectedSeats
    }

    const options = {
      url: `${NODE_URL}/reservations`,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8'
      },
      data
    };

    const response = await axios(options);
    console.log(response.data);
  
  }

</script>

<template>
    <div class="main-wrapper">
        <div class="main-container flex justify-center">
            <div class="hero-section ">
                <div class="logo">
                    <img src="../assets/wab-logo.jpg" alt="logo" />
                </div>
            </div>
            <seatingChart @changedSelectedSeats="(seats) => selectedSeats = seats"></seatingChart>
            <div class="grid-section">
                <div id="components" class="card forms">
                  <form novalidate @submit="onSubmit" :initial-values="formValues">
                    <div class="form-wrapper" >
                        <FloatLabel class="form-input-wrapper">
                            <label for="email">Email</label>
                            <InputText id="email" class="form-input" v-model="email"/>
                            <small id="email-help" class="p-error">
                              {{ errors.email }}
                            </small>
                        </FloatLabel>
                        <FloatLabel class="form-input-wrapper">
                            <label for="fullName">Full name</label>
                            <InputText id="fullName" class="form-input" v-model="fullName" />
                            <small id="full-name-help" class="p-error">
                              {{ errors.fullName }}
                            </small>
                        </FloatLabel>
                        <Button severity="contrast" plain raised text :disabled="!meta.valid || selectedSeats?.length === 0" label="Proceed to payment" type="submit"/>
                    </div>
                  </form>
                </div>
            </div>
            <stripe-checkout
              ref="checkoutRef"
              mode="payment"
              :pk="publishableKey"
              :line-items="lineItems"
              :success-url="successURL"
              :cancel-url="cancelURL"
              @loading="v => loading = v"
            />
        </div>
        
    </div>
</template>

<style scoped lang="scss">
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

  .hero-section {
      
  }

  .hero-section .logo {

    display: flex;
    justify-content: center;

      img {
        max-width: 25vw;
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

</style>