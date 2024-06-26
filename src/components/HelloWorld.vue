<script setup lang="js">
  import { useForm, FieldArray } from 'vee-validate';
  import { StripeCheckout } from '@vue-stripe/vue-stripe';
  import seatingChart from './seatingChart.vue';
  import { ref, onMounted, computed } from 'vue';
  import * as yup from 'yup';
  import axios from 'axios'
  import { watch } from 'vue';

  const NODE_URL = 'http://localhost:8080';

  const publishableKey = "pk_live_51PV02HRtieu1iWXNV7q59QGx1WNQ3fn6LPUAohDkZTfKKNGrdiJml9p1UThILfarkYQFyLTGu49M0cWJRtAgJlom00z2rnj5MB";
  const successURL = 'your_success_url';
  const cancelURL = 'your_error_url';
  const ticketItems= [
        {
          id: '1',
          price: '80',
          label: 'Food',
          quantity: 1,
        },
        {
          id: '2',
          price: '95',
          label: 'Dinner + Zamalek',
          quantity: 1,
        },
        {
          id: '3',
          price: '120',
          label: 'Dinner + Wine Pairing',
          quantity: 1,
        }
  ];

  function ticketPrice(ticketId){
    let matchingTicket = ticketItems.find((ticketType) => ticketType.id === ticketId);
    console.log(ticketItems)
    console.log(ticketId)
    return matchingTicket?.price ?? "-100";
  }

  const grandTotalPrice = computed(() => {
    return values.seats.reduce((acc, seat) => {
      return acc + parseInt(ticketPrice(seat.seatType))
    }, 0)
  })

  const selectedSeats = ref([]);
  console.log(selectedSeats.value)
  const formValues = {
    email: 'adam.hochschild@mail.com',
    fullName: 'adam hochschild',
    seats: selectedSeats?.value?.map(() => {
        seatNumber: "";
        seatType: "1";
        isAnonymous: false;
        isRandom: false;
        seatFullName: "";
    })
  }

  const schema = yup.object({
    email: yup.string().required().email().label('Email address'),
    fullName: yup.string().required().label('Full name'),
    seats: yup.array().of(yup.object({
      seatNumber: yup.string().required(),
      seatType: yup.mixed().oneOf(["1", "2", "3"]).defined(),
      isAnonymous: yup.boolean().required(),
      isRandom: yup.boolean().required,
      seatFullName: yup.string()
    }))
  });

  const { values, defineField, handleSubmit, setFieldValue, resetForm, errors, meta } = useForm({
    initialValues: formValues,
    validationSchema: schema,
  });

  const [fullName] = defineField('fullName');
  const [email] = defineField('email');
  const [seats, seatsAttrs] = defineField('seats');

  const onSubmit = handleSubmit((values) => {

    const cleanArr = JSON.parse(JSON.stringify(Array.from(selectedSeats.value)));
    console.log('Submitted with', {...values, selectedSeats: cleanArr });

    // submitReservation({...values, selectedSeats: cleanArr });
  });


  watch(selectedSeats, (newSeats, oldSeats) => {
    
    let newValue = [ 
        newSeats.map((seat) =>  {

          let oldSeatEquiv = seats.value.find((oldSeat) => oldSeat.seatNumber === seat.label)
          
          return {
            seatNumber: seat.label,
            seatType: oldSeatEquiv?.seatType ?? "1",
            isAnonymous: oldSeatEquiv?.isAnonymous ?? false,
            isRandom: oldSeatEquiv?.isRandom ?? false,
            seatFullName: oldSeatEquiv?.seatFullName ?? ""
          }
        })
      ]
    setFieldValue('seats', ...newValue)
  }, { immediate: true })

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
      <p>HELLO WORLD</p>
      <!-- <stripe-checkout
          ref="checkoutRef"
          mode="payment"
          :pk="publishableKey"
          :line-items="lineItems"
          :success-url="successURL"
          :cancel-url="cancelURL"
        /> -->
        <div class="main-container flex justify-center">
            <div class="hero-section ">
                <div class="logo">
                    <img src="../assets/wab-logo.jpg" alt="logo" />
                </div>
            </div>
            <seatingChart @changedSelectedSeats="(newSeats) => selectedSeats = newSeats "></seatingChart>
            <div class="grid-section">
                <div id="components" class="card forms">

                  <form novalidate @submit="onSubmit" :initial-values="formValues">

                    <div class="selected-info">
                      <div class="selected-info__heading">
                          Selected seats
                      </div>
                      <div class="selected-info__wrapper">
                          <div v-if="!selectedSeats.length">
                              None
                          </div>
                          <FieldArray name="seats" v-slot="{ fields, push, remove }"> 
                            <div 
                              v-for="(seat, index) in selectedSeats"
                              :key="seat.label"
                              class="selected-info__seat"
                              value="1" 
                          >
                              <Card>
                                  <template #title>
                                    Seating Info
                                  </template>
                                  <template #content>
                                    <div class="d-flex justify-center">
                                    <SelectButton
                                        v-model="seats[`${index}`].isRandom"
                                        :options="[
                                          {value: false, label: seat.label}, 
                                          {value: true, label: 'Random'}
                                        ]" 
                                        optionLabel="label" 
                                        optionValue="value"
                                        dataKey="value" 
                                        :allowEmpty="false"
                                        aria-labelledby="custom" 
                                      >
                                        <template #option="slotProps">
                                          {{slotProps.option.label}}
                                        </template>
                                      </SelectButton>
                                    </div>
                                    <div class="selected-info__input-wrapper">
                                      <div class="d-flex flex-row justify-between w100 align-center">
                                        <Checkbox 
                                          v-model="seats[`${index}`].isAnonymous" :binary="true"
                                          :trueValue="false"
                                          :falseValue="true"
                                        />
                                        <label :for="`seats[${index}].isAnonymous`"
                                          style="padding: 0 1em;"
                                        >
                                            Display on seating chart
                                        </label>
                                      </div>
                                      
                                      <InputGroup>
                                        <InputGroupAddon>
                                          <span class="pi pi-user"></span>
                                        </InputGroupAddon>
                                      
                                        <InputText :id="`seats[${index}].seatFullName`" class="form-input" v-model="seats[`${index}`].seatFullName" placeholder="Full Name"/>
                                      
                                      </InputGroup>

                                      <div class="d-flex flex-col">
                                        
                                        <div 
                                          class="selected-info__radio-input"
                                          v-for="(ticketType, ticketIdx) in ticketItems"
                                          :key="ticketIdx"
                                        >
                                          <RadioButton :inputId="`seats[${index}].seatType-1`" class="form-input" v-model="seats[`${index}`].seatType" :value="ticketType.id"/>
                                          <label :for="`seats[${index}].seatType-${ticketType.id}`">
                                            {{ticketType.label}}
                                          </label>
                                        </div>
                                      </div>
                                      <div class="d-flex justify-between flex-row">
                                        <span class="selected-info__input-total-title">
                                          Total
                                        </span>
                                        <span class="selected-info__input-total-price">
                                          ${{ 
                                            ticketPrice(seats[`${index}`].seatType) 
                                          }}
                                        </span>
                                      </div>
                                    </div>
                                  </template>
                              </Card>
                          </div>
                          </FieldArray>
                          
                      </div>
                  </div>
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
                        <div class="d-flex justify-between flex-row align-center w100">
                          <span>
                            Total : ${{grandTotalPrice}}
                          </span>
                          <Button severity="contrast" plain raised text :disabled="!meta.valid || selectedSeats?.length === 0" label="Proceed to payment" type="submit"/>
                        </div>
                    </div>
                    {{ values }}
                  </form>
                </div>
            </div>
           
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
          
        }

        &__radio-input{
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          white-space: nowrap;
        }
        
    }

</style>