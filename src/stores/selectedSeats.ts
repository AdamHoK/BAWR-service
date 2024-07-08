import { ref } from 'vue';
import { defineStore } from 'pinia'

export const useSelectedSeatsStore = defineStore('selectedSeats', {
    state: () => ({ reservationEmail: "", selectedSeats: [], onPaymentStage: false, clientSecret: "" }),
    getters: {
      getSeats: (state) => Array.from(state.selectedSeats),
      getEmail: (state) => state.reservationEmail,
      getPaymentStage: (state) => state.onPaymentStage,
      getClientSecret: (state) => state.clientSecret,
      includesSeat: (state) => {
        return (seat) => {
            return state.selectedSeats.find((seatIter) => seatIter.seatLabel === seat.seatLabel)
        };
      }
    }, 
    actions: {
      setClientSecret(secret) {
        this.clientSecret = secret;
      },
      setSeats(seats) {
        this.selectedSeats = seats;
      },
      setEmail(email: String){
        this.reservationEmail = email
      },
      addSeat(seat) {
        this.selectedSeats.push(seat)
      },
      deleteSeat(seat){
        this.selectedSeats = 
            this.selectedSeats.filter(seatIter => {
                return seatIter.seatLabel !== seat.seatLabel
            });
      },
      setPaymentStage(newStage: boolean) {
        this.onPaymentStage = newStage
      }
    }
  })