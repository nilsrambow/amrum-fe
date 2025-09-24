<template>
  <v-container fluid class="fill-height">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>
              <v-icon icon="mdi-home-variant" class="me-2"></v-icon>
              Amrum Property Management
            </v-toolbar-title>
          </v-toolbar>
          
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="credentials.username"
                label="Username"
                name="username"
                prepend-icon="mdi-account"
                type="text"
                :rules="[rules.required]"
                required
              ></v-text-field>
              
              <v-text-field
                v-model="credentials.password"
                label="Password"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                :rules="[rules.required]"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="handleLogin"
              :loading="loading"
              :disabled="!isFormValid"
            >
              Login
            </v-btn>
          </v-card-actions>
          
          <v-alert
            v-if="error"
            type="error"
            class="ma-4"
            dismissible
            @click:close="error = ''"
          >
            {{ error }}
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { login } = useAuth();

const credentials = ref({
  username: '',
  password: ''
});

const loading = ref(false);
const error = ref('');

const rules = {
  required: (value: string) => !!value || 'This field is required'
};

const isFormValid = computed(() => {
  return credentials.value.username.trim() !== '' && 
         credentials.value.password.trim() !== '';
});

const handleLogin = async () => {
  if (!isFormValid.value) return;
  
  loading.value = true;
  error.value = '';
  
  try {
    await login(credentials.value);
    // Redirect to home page after successful login
    router.push('/');
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Login failed. Please check your credentials.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
