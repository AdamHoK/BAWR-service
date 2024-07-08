

<template>
  <div class="payment-wrapper">
    <div class="payment-container">
    <div>
      <div v-if="typeOneTickets.length">
        {{ typeOneTickets.length }} x Dinner Ticket<span v-if="typeOneTickets.length > 1">s</span> : {{typeOneTickets.length * ticketPrice('1')}}
      </div>
      <div v-if="typeTwoTickets.length">
        {{ typeTwoTickets.length }} x Dinner + Zamalek Ticket<span v-if="typeTwoTickets.length > 1">s</span> : {{ typeTwoTickets.length * ticketPrice('2') }}
      </div>
      <div v-if="typeThreeTickets.length">
        {{typeThreeTickets.length}} x Dinner + Wine Pairing Ticket<span v-if="typeThreeTickets.length > 1">s</span> : {{ typeThreeTickets.length * ticketPrice('3') }}
      </div>
    </div>
<!--    {{ elementsOptions }}-->
    <StripeElements
      v-if="stripeLoaded"
      v-slot="{ elements, instance }"
      ref="elms"
      :stripe-key="stripeKey"
      :instance-options="instanceOptions"
      :elements-options="elementsOptions"
      style="width: 100%"
    >
      <StripeElement
        ref="payment"
        type="payment"
        :elements="elements"
        :options="paymentOptions"
        style="width: 100%"
      />
    </StripeElements>
    <Button type="button" @click="pay">Pay</Button>
    </div>
  </div>
</template>

<script>
import { ref, defineComponent, onMounted, onBeforeUnmount } from 'vue'
    import { loadStripe } from '@stripe/stripe-js'
    import { StripeElements, StripeElement } from 'vue-stripe-js'
    import { storeToRefs } from 'pinia'
    import { useSelectedSeatsStore } from '../stores/selectedSeats';
    import axios from 'axios'

    const NODE_URL = 'http://localhost:8080';
    export default defineComponent({
      name: 'PaymentPage',
      setup() {
        const selectedSeatsStore = useSelectedSeatsStore();
        const { selectedSeats, clientSecret } = storeToRefs(selectedSeatsStore)
        const paymentIntent = ref({});

        // When setting up, should create a payment intent based on selectedSeats in store
        const stripeKey = ref('pk_test_51PV02HRtieu1iWXNObuElAYnVg0Q0ZWn4yIw6z5qM3OzmFfiSqhZeaL92iw37bMhvauB321JWROohFtt34E4QPle00f4zq5BJn');
        const stripePromise = loadStripe(stripeKey.value)

        const instanceOptions = ref({
          // https://stripe.com/docs/js/initializing#init_stripe_js-options
        })

        const appearance = {
          theme: 'flat',
          variables: {
            fontLineHeight: '1.5',
            borderRadius: '2px',
            colorBackground: '#F6F8FA',
            accessibleColorOnColorPrimary: '#262626'
          },
          rules: {
            '.Block': {
              backgroundColor: 'var(--colorBackground)',
              boxShadow: 'none',
              padding: '12px'
            },
            '.Input': {
              padding: '12px'
            },
            '.Input:disabled, .Input--invalid:disabled': {
              color: 'lightgray'
            },
            '.Tab': {
              padding: '10px 12px 8px 12px',
              border: 'none'
            },
            '.Tab:hover': {
              border: 'none',
              boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
            },
            '.Tab--selected, .Tab--selected:focus, .Tab--selected:hover': {
              border: 'none',
              backgroundColor: '#fff',
              boxShadow: '0 0 0 1.5px var(--colorPrimaryText), 0px 1px 1px rgba(0, 0, 0, 0.03), 0px 3px 7px rgba(18, 42, 66, 0.04)'
            },
            '.Label': {
              fontWeight: '500'
            }
          }
        };

        const elementsOptions = ref({
          clientSecret,
          appearance
        })

        const stripeLoaded = ref(false)
        const payment = ref();
        const paymentOptions = ref({
          layout: {
            type: "tabs",
          }
        })

        const elms = ref()

        // Seat stuff
        const typeOneTickets = selectedSeats.value.filter((seat) => seat.seatType == '1')
        const typeTwoTickets = selectedSeats.value.filter((seat) => seat.seatType == '2')
        const typeThreeTickets = selectedSeats.value.filter((seat) => seat.seatType == '3')

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


        onMounted(async () => {
          const stripe = await stripePromise;
          const { retrievePaymentIntent } = stripe

          console.log(stripe);

          stripeLoaded.value = true;

          const paymentIntentResponse = await retrievePaymentIntent(
            clientSecret.value
          );
          console.log(paymentIntentResponse);
          paymentIntent.value = paymentIntentResponse;

        })
        onBeforeUnmount(async () => {
          console.log(`UnBeforeUnmount, paymentIntent: `,paymentIntent.value);
          console.log("UnBeforeUnmount, paymentIntent ID",paymentIntent.value['id']);
          console.log(`UnBeforeUnmount, paymentIntent.PI ID: ${paymentIntent.value.paymentIntent.id}`);
          const data = {
            cancellation_reason: "abandoned",
            client_secret: paymentIntent.value.paymentIntent.id
          }

          const options = {
            url: `${NODE_URL}/payments/cancel-payment-intent`,
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json;charset=UTF-8'
            },
            data
          };

          const response = await axios(options);
          console.log(response);
        })

        return {
          typeOneTickets,
          typeTwoTickets,
          typeThreeTickets,
          elementsOptions,
          ticketItems,
          stripeKey,
          instanceOptions,
          payment,
          appearance,
          paymentIntent,
          paymentOptions,
          stripeLoaded,
          stripePromise,
          elms
        }
      },

      components: {
        StripeElements,
        StripeElement
      },
      methods: {
        async cancelPaymentIntent() {

        },
        ticketPrice(ticketId){
          let matchingTicket = this.ticketItems.find((ticketType) => ticketType.id === ticketId);
          return matchingTicket?.price ?? "-100";
        },
        async pay() {
          try {

            if (!this.elms || !this.elms.instance) {
              throw new Error('Stripe elements instance is not properly initialized.');
            }

            const { error } = await this.elms.instance.confirmPayment({
              elements: this.elms.elements,
              confirmParams: {
                return_url: 'https://example.com',
              },
            });

            if (error) {
              console.error('Payment confirmation error:', error);
            } else {
              console.log('Payment confirmed successfully!');
            }
          } catch (error) {
            console.error('An error occurred during payment confirmation:', error);
          }
        }
      }

    })


</script>

<style lang="scss" scoped>
    * {
      transition: all 0.25s ease-in-out;
    }

    .payment-wrapper {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .payment-container {
        display: flex;
        justify-content: center;
        min-width: 30vw;
        margin: 0 auto;
        flex-direction: column;
        align-items: center;
        gap: 1em;

        Button {
          width: 100%;
        }
      }


    }
</style>