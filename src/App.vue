<script setup >
import { useRoute } from 'vue-router';
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import AuthModal from './components/auth/AuthModal.vue'
import UserDashboardModal from './components/user/UserDashboardModal.vue'
const route=useRoute()
</script>

<template>
  <div class="min-h-screen bg-mboa-belge dark:bg-gray-950 flex flex-col">
    <AppHeader v-if="!route.meta.hideLayout" />
    <main class="flex-1">
      <router-view />
    </main>
    <AppFooter v-if="!route.meta.hideLayout"/>
    <AuthModal/>
    <UserDashboardModal />
  </div>
</template>

