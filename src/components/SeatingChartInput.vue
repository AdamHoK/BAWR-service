<script setup>
    import { useForm, FieldArray } from 'vee-validate';
    import { ref, onMounted, computed } from 'vue';
    import * as yup from 'yup';
    import axios from 'axios'
    
    import { storeToRefs } from 'pinia'
    import {useSelectedSeatsStore} from '../stores/selectedSeats';

    // const NODE_URL = 'http://localhost:8080';
    const NODE_URL = 'https://bawr-service-server.vercel.app';
    const selectedSeatsStore = useSelectedSeatsStore();
    const { selectedSeats } = storeToRefs(selectedSeatsStore)

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

    const formValues = {
        email: 'adam.hochschild2001@gmail.com',
        seats: []
    }

    const schema = yup.object({
        email: yup.string().required().email().label('Email address'),
        seats: yup.array().of(yup.object({
            seatLabel: yup.string().required(),
            seatType: yup.mixed().oneOf(["1", "2", "3"]).defined(),
            isAnonymous: yup.boolean().required(),
            isRandom: yup.boolean().required(),
            seatFullName: yup.string()
        }))
    });


    const { values, defineField, handleSubmit, setFieldValue, resetForm, errors, meta } = useForm({
        initialValues: formValues,
        validationSchema: schema,
    });
    const [email] = defineField('email');
    const [seats, seatsAttrs] = defineField('seats');
    mapSelectedToField(selectedSeats.value)

    function ticketPrice(ticketId){
        let matchingTicket = ticketItems.find((ticketType) => ticketType.id === ticketId);
        return matchingTicket?.price ?? "-100";
    }

    const grandTotalPrice = computed(() => {
        return values.seats.reduce((acc, seat) => {
        return acc + parseInt(ticketPrice(seat.seatType))
        }, 0)
    })


    const onSubmit = handleSubmit(async (values) => {
        
        selectedSeatsStore.setSeats(values.seats);
        selectedSeatsStore.setEmail(values.email);

        console.log('Submitted with', {...values});

        await submitReservation({...values });
        selectedSeatsStore.setPaymentStage(true);
    });

    function mapSelectedToField(seatsToSelect){
        let newValue = [ 
            seatsToSelect.map((seat) =>  {
                let oldSeatEquiv = seats.value.find((oldSeat) => oldSeat?.seatLabel === seat.seatLabel)
                    
                return {
                    seatLabel: seat.seatLabel,
                    seatType: oldSeatEquiv?.seatType ?? (seat.seatType ?? "1"),
                    isAnonymous: oldSeatEquiv?.isAnonymous ?? seat.isAnonymous ?? false,
                    isRandom: oldSeatEquiv?.isRandom ?? seat.isRandom ?? false,
                    seatFullName: oldSeatEquiv?.seatFullName ?? seat.seatFullName ?? ""
                }
            })
        ]
        setFieldValue('seats', ...newValue)
    }

    selectedSeatsStore.$subscribe((mutation, state) => {
        const { selectedSeats: newSeats } = state;
        mapSelectedToField(newSeats);
    })
    
    async function submitReservation(values) {
        const data = {
            email: values.email,
            seats: values.seats
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
        if(response.data.clientSecret) {
          console.log('Setting client secret to', response.data.clientSecret)
          selectedSeatsStore.setClientSecret(response.data.clientSecret);
        }
        console.log(response.data);
    }
</script>
<template>
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
                    <div class="d-flex justify-between flex-row align-center w100">
                        <span>
                        Total : ${{grandTotalPrice}}
                        </span>
                        <Button severity="contrast" plain raised text :disabled="!meta.valid || selectedSeats?.length === 0" label="Proceed to payment" type="submit"/>
                    </div>
                    <!-- {{ values }} -->
                </div>

                <div class="selected-info">
                <div class="selected-info__heading">
                  {{ $t('table_info.selected_seats') }}
                </div>
                <div class="selected-info__wrapper">
                    <div v-if="!selectedSeats.length">
                        None
                    </div>
                    <FieldArray name="seats" v-slot="{ fields, push, remove }"> 
                        <div 
                            v-for="(seat, index) in seats"
                            :key="seat.seatLabel"
                            class="selected-info__seat"
                            value="1" 
                        >
                            <Card>
                                <template #title>
                                Seating Info
                                </template>
                                <template #content>
                                    <!-- {{ seat }} -->
                                <div class="d-flex justify-center">
                                <SelectButton
                                    v-model="seats[`${index}`].isRandom"
                                    :options="[
                                        {value: false, label: seat.seatLabel}, 
                                        {value: true, label: $t('table_info.random')}
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
                                    
                                    <InputGroup>
                                    <InputGroupAddon>
                                        <span class="pi pi-user"></span>
                                    </InputGroupAddon>
                                    
                                    <InputText :id="`seats[${index}].seatFullName`" class="form-input" v-model="seats[`${index}`].seatFullName" placeholder="Full Name"/>
                                    
                                    </InputGroup>
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
            
                
            </form>
        </div>
    </div>    
</template>

<style lang="scss">
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
        margin: 15px 0;
        display: flex;
        flex-direction: column;
        width: 100%;

        .form-input {
            width: 100%;
        }
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
            display: grid;
            grid-template-columns: 33% 33% 33%;
            gap: 1em;
            width: 100%;
            align-items: center;
            justify-content: flex-start;
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
</style>