<script>
    import axios from 'axios';
    // const NODE_URL = 'http://localhost:8080';
    const NODE_URL = 'https://bawr-service-server.vercel.app';
    import {useSelectedSeatsStore} from '../stores/selectedSeats';
    import { storeToRefs } from 'pinia'
    export default {
        data() {
            return {
                selectedSeatsStore: null,
                seatingInfo: {},
                emptySeatingInfo: [
                    {
                        label: 'Table du Nord',
                        seats: []
                    },
                    {
                        label: 'Table du Sud',
                        seats: []
                    }
                ],
                selectedSeats: null
            }
        },
        computed: {},
        methods: {
            isReserved(seat){
                console.log(seat);
                if(seat.seatNumber < 37){
                    return this.emptySeatingInfo[0].seats[seat.seatNumber-1].isReserved;
                } else if(seat.seatNumber > 36) {
                    return this.emptySeatingInfo[1].seats[seat.seatNumber%37].isReserved;
                }
                return false;
            },
            selectSeat(seat, event=null){

                if(this.isReserved(seat)) {
                    this.$refs[`reservedInfo${seat.seatNumber}`][0].show(event)
                    return
                }

                if(!seat.occupied && this.selectedSeats.length >= 4){
                    return;
                }

                seat.occupied = !seat.occupied;
                
                if(this.selectedSeatsStore.includesSeat(seat)){
                    this.selectedSeatsStore.deleteSeat(seat)
                } else {
                    this.selectedSeatsStore.addSeat(seat)
                }
            }
        },
        created() {
            this.selectedSeatsStore = useSelectedSeatsStore();
            this.selectedSeats  = storeToRefs(this.selectedSeatsStore).selectedSeats;
        },
        async mounted() {
            const response = await axios.get(`${NODE_URL}/reservations`);

            for(let i=0; i<72; i++){
                if(i < 72/2) {
                    this.emptySeatingInfo[0].seats.push(
                        {   
                            seatNumber: i+1,
                            occupied: false,
                            seatLabel: `S${(i+1)%37}`,
                            isReserved: false,
                            seatFullName: null
                        }
                    )
                }
                else {
                    this.emptySeatingInfo[1].seats.push(
                        {
                            seatNumber: i+1,
                            occupied: false,
                            seatLabel: `N${(i+1)%37+1}`,
                            isReserved: false,
                            reservationName: null
                        }
                    )
                }
            }


            console.log(response.data)
            response.data.reservations.forEach((res) => { 
                if(res.seat_number == null) return;
                console.log(`${res.seat_number} is reserved`)
                if(res.seat_number < 37) {
                    this.emptySeatingInfo[0].seats[res.seat_number - 1].isReserved = true;
                    this.emptySeatingInfo[0].seats[res.seat_number - 1].reservationName = res.full_name;
                }
                if(res.seat_number >= 37) {
                    this.emptySeatingInfo[1].seats[res.seat_number%37 ].isReserved = true;
                    this.emptySeatingInfo[1].seats[res.seat_number%37 ].reservationName = res.full_name;
                }
            })
        }
    }


</script>

<template>

    <div class="tables-wrapper">
        <div v-for="(table, index) in this.emptySeatingInfo" class="table-info">
            <div class="table-info__table dss-fs-nmi">
                <template v-if="index%2">{{ $t('table_info.north_table') }}</template>
                <template v-else>{{ $t('table_info.south_table') }}</template>
            </div>
            <!-- <template #fallback>
                <Skeleton v-for="(seat, index) in table.seats" 
                    shape="circle" size="clamp(30px, 2.5vw, 60px)" class="mr-2 table-info__seat table-info__seat-skeleton"
                    :class="{
                        left: index%2==1,
                        right: index%2==0 && index !== 0,
                        head: index == 0,
                        foot: index == table.seats.length - 1 && table.seats.length%2 == 0
                    }"    
                >
                </Skeleton>
            </template> -->
            
            <div v-for="(seat, index) in table.seats" 
                class="table-info__seat" 
                @click="selectSeat(seat, $event)"
                :id="`table-info__seat-${seat.seatNumber}`"
                :class="{
                    occupied: isReserved(seat),
                    selected: this.selectedSeatsStore.includesSeat(seat),
                    left: index%2==1,
                    right: index%2==0 && index !== 0,
                    head: index == 0,
                    foot: index == table.seats.length - 1 && table.seats.length%2 == 0
                }"
            >
                <div class="table-info__seat-number">
                    {{ seat.seatLabel }}
                </div>
                <Popover v-if="isReserved(seat)" :ref="`reservedInfo${seat.seatNumber}`" class="table-info__seat-info" appendTo: self>
                    <div>
                      {{ $t('table_info.reserved_by') }} {{ seat.reservationName }}
                    </div>
                </Popover>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
    $seatToTableGap: .5em;
    $betweenSeatGap: .5em;

    .tables-wrapper {
        display: grid;
        grid-template-rows: 50% 50%;
        justify-items: center;
        max-width: 1080px;
        margin: 0 auto;

        @media only screen and (max-width: 991px){
            grid-template-rows: unset;
            grid-template-columns: 50% 50%;
        }
    }

    .table-info {

        display: grid;
        grid-template-rows: auto 40% auto;
        min-height: 250px;
        width: 100%;

        @media only screen and (max-width: 991px){
            grid-template-rows: unset;
            grid-template-columns: auto;
        }

        &__table {
            grid-column: 2 / span 17;
            grid-row: 2;
            
            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-wrap: wrap;
            font-size: 36px;

            height: 100%;
            width: 100%;
            border: 1px solid black;

            @media only screen and (max-width: 991px){
                grid-row: 2 / span 17;
                grid-column: 2;
                font-size: 22px;
            }
        }

        

        &__seat {
        
            margin: $seatToTableGap $betweenSeatGap;
            position: relative;

            display: block;
            border: 1px solid black;
            border-radius: 50%;
            height: clamp(30px, 2.5vw, 60px);
            aspect-ratio: 1;
            transition: all ease-in-out .25s;

            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 12px;

            &-info {
                z-index: 1;
            }

            &-number {
                visibility: hidden;
                color: white;
            }
            
            &.selected {
                background-color: rgb(197, 229, 197);
            }

            &.occupied {
                background: rgb(255, 185, 185);
            }

            &.left {
                grid-row: 1;
                align-self: end;
            }

            &.right  {
                grid-row: 3;
                align-self: baseline;
            }

            &.head, &.foot {
                grid-row: 1 / span 3;
                align-self: center;
            }

            @media only screen and (max-width: 991px){

                margin: $betweenSeatGap $seatToTableGap;

                &.left {
                    grid-row: unset;
                    grid-column: 1;
                    justify-self: end;
                }

                &.right  {
                    grid-row: unset;
                    grid-column: 3;
                    justify-self: start;
                }

                &.head, &.foot {
                    grid-row: unset;
                    grid-column: 1 / span 3;
                    justify-self: center;
                }
            }
            
            &:hover:not(.occupied){
                background-color: rgb(176, 176, 176);
            }

            &:hover {
                cursor: pointer;
                .table-info__seat-number{
                    visibility: unset;
                }
            }

            &-skeleton {
                border: none;
                &:hover {
                    background-color: var(--p-skeleton-background) !important;
                    cursor: unset;
                }
            }

        }
    }
    
</style>

