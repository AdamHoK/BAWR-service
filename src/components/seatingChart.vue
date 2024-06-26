<script>
    import axios from 'axios';
    const NODE_URL = 'http://localhost:8080';

    export default {
        data() {
            return {
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
                selectedSeats: new Set()
            }
        },
        computed: {},
        methods: {
            isReserved(seat){
                
                if(seat.seatNum < 37){
                    return this.emptySeatingInfo[0].seats[seat.seatNum-1].isReserved;
                } else if(seat.seatNum > 36) {
                    return this.emptySeatingInfo[1].seats[seat.seatNum%37].isReserved;
                }
                return false;
            },
            selectSeat(seat, event=null){
                if(this.isReserved(seat)) {
                    this.$refs[`reservedInfo${seat.seatNum}`][0].show(event)
                    return
                };

                if(!seat.occupied && this.selectedSeats.size >= 4){
                    return;
                }

                seat.occupied = !seat.occupied;
                
                if(this.selectedSeats.has(seat)){
                    this.selectedSeats.delete(seat)
                } else {
                    this.selectedSeats.add(seat)
                }
                
                this.$emit('changedSelectedSeats', Array.from(this.selectedSeats));
            }
        },
        async mounted() {
            
            const response = await axios.get(`${NODE_URL}/reservations`);

            for(let i=0; i<72; i++){
                if(i < 72/2) {
                    this.emptySeatingInfo[0].seats.push(
                        {   
                            seatNum: i+1,
                            occupied: false,
                            label: `S${(i+1)%37}`,
                            isReserved: false,
                            reservationName: null,
                        }
                    )
                }
                else {
                    this.emptySeatingInfo[1].seats.push(
                        {
                            seatNum: i+1,
                            occupied: false,
                            label: `N${(i+1)%37+1}`,
                            isReserved: false,
                            reservationName: null
                        }
                    )
                }
                
            }


            console.log(response.data)
            response.data.reservations.forEach((res) => { 
                if(res.seat_number == null) return;
                
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
        <div v-for="table in this.emptySeatingInfo" class="table-info">
            <div class="table-info__table dss-fs-nmi">
                {{table.label}}
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
                :id="`table-info__seat-${seat.seatNum}`"
                :class="{
                    occupied: isReserved(seat),
                    selected: this.selectedSeats.has(seat),
                    left: index%2==1,
                    right: index%2==0 && index !== 0,
                    head: index == 0,
                    foot: index == table.seats.length - 1 && table.seats.length%2 == 0
                }"
            >
                <div class="table-info__seat-number">
                    {{ seat.label }}
                </div>
                <Popover v-if="isReserved(seat)" :ref="`reservedInfo${seat.seatNum}`" class="table-info__seat-info" appendTo: self>
                    <div>
                        Reserved by {{ seat.reservationName }}
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

