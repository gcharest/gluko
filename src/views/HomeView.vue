<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (route: string) => {
  router.push(route)
}
</script>

<template>
  <div class="container">
    <div class="px-4 py-5 my-5 text-center">
      <h1 class="display-4 fw-bold mb-4">{{ $t('navigation.home') }}</h1>
      <div class="col-lg-8 mx-auto">
        <p class="lead mb-4">{{ $t('aboutText.para1') }}</p>
        <p class="mb-4">{{ $t('notices.experimental.title') }}</p>

        <div class="row g-4 py-4">
          <!-- Calculator Card -->
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-body">
                <h2 class="card-title h4">{{ $t('components.mealCalculator.title') }}</h2>
                <p class="card-text">{{ $t('aboutText.para2') }}</p>
                <button class="btn btn-primary w-100" @click="navigateTo('/calculator')">
                  {{ $t('navigation.home') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Search Card -->
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-body">
                <h2 class="card-title h4">{{ $t('components.search.title') }}</h2>
                <p class="card-text">{{ $t('aboutText.para3') }}
                  <a :href="$t('aboutText.url')" target="_blank" class="link-primary">
                    {{ $t('aboutText.CNF') }}
                  </a>.
                </p>
                <button class="btn btn-secondary w-100" @click="navigateTo('/carb-factor')">
                  {{ $t('navigation.carbFactor') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
