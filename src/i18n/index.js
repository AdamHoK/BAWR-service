import { createI18n } from "vue-i18n";

const messages = {
  en: {
    table_info: {
      north_table: 'North Table',
      south_table: 'South Table',
      reserved_by: 'Reserved By',
      random: 'Random'
    },
    locale: {
      'en' : 'English',
      'fr' : 'French'
    },
  },
  fr: {
    table_info: {
      north_table: 'Table du Nord',
      south_table: 'Table du Sud',
      reserved_by: 'Reservé(e) par',
      random: 'Aléatoire'
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
