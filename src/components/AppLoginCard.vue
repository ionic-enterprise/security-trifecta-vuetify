<template>
  <v-card class="auth-card rounded-lg">
    <v-card-title data-testid="title"> Login </v-card-title>
    <v-card-subtitle data-testid="subtitle">Please enter your credentials</v-card-subtitle>
    <v-card-text>
      <v-form>
        <v-text-field
          label="Email Address"
          variant="underlined"
          type="email"
          name="email"
          v-model="email"
          :error-messages="errors.email"
          data-testid="email-input"
        />
        <div></div>
        <v-text-field
          label="Password"
          variant="underlined"
          name="password"
          v-model="password"
          :error-messages="errors.password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
          @input="signinError = false"
          :type="showPassword ? 'text' : 'password'"
          data-testid="password-input"
        />
      </v-form>
      <v-alert class="mt-3" v-model="signinError" type="error" data-testid="signin-error">
        Invalid Credentials. Please try again.
      </v-alert>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="doLogin" :disabled="!meta.valid" data-testid="signin-button"> Sign In </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useField, useForm } from 'vee-validate';
import { object as yupObject, string as yupString } from 'yup';
import { ref } from 'vue';
import { useAuth } from '@/composables/auth';
import { useSync } from '@/composables/sync';
import { useSessionVault } from '@/composables/session-vault';

const emit = defineEmits(['success']);

const signinError = ref<boolean>(false);
const showPassword = ref<boolean>(false);

const validationSchema = yupObject({
  email: yupString().required().email().label('Email Address'),
  password: yupString().required().label('Password'),
});

const { errors, meta } = useForm({ validationSchema });

const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

const doLogin = async () => {
  const { login } = useAuth();
  if (await login(email.value, password.value)) {
    const sync = useSync();
    const { initializeUnlockMode } = useSessionVault();
    await sync();
    await initializeUnlockMode();
    emit('success');
  } else {
    signinError.value = true;
  }
};
</script>
