import { createI18n } from "vue-i18n";

const messages = {
  en: {
    landing_page: {
      coming_soon: "Coming Soon"
    },
    table_info: {
      north_table: 'North Table',
      south_table: 'South Table',
      reserved_by: 'Reserved By',
      random: 'Random',
      selected_seats: 'Selected seats'
    },
    locale: {
      'en' : 'English',
      'fr' : 'French'
    },
  },
  fr: {
    landing_page: {
      coming_soon: "Bientôt disponible"
    },
    table_info: {
      north_table: 'Table du Nord',
      south_table: 'Table du Sud',
      reserved_by: 'Reservé(e) par',
      random: 'Aléatoire',
      selected_seats: 'Places selectionnés'
    },
    locale: {
      'en' : 'Anglais',
      'fr' : 'Français'
    },
  }
}

export default createI18n({
  locale:'fr',
  fallbackLocale: 'en',
  messages
})
