<script setup>
  import { useI18n } from 'vue-i18n'
  const { t } = useI18n()
</script>

<template>
    <div class="d-flex justify-center align-center w100" style="height: 100%; overflow: hidden; position: absolute; top:0; left:0">
        <div class="logo dss-fs-nmi">
            <img src="../assets/wab-logo.jpg" alt="logo" />
            {{ t("home.created_by") }}
            <a href="https://www.instagram.com/wineandbouffe/">
              {{ t("home.header") }}
            </a>
            <LanguageSwitcher></LanguageSwitcher>
        </div>
    </div>
</template>

<style lang="scss">

    .logo{ 
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        img {
            max-width: 250px;
        }
    }

</style>