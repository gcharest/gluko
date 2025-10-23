<script setup lang="ts">
// Access build-time constants
const version = __APP_VERSION__
const buildDate = new Date(__BUILD_DATE__).toISOString().slice(0, 10)
</script>
<template>
  <footer class="footer mt-auto py-3">
    <div class="container">
      <div class="row text-end">
        <div class="col">
          <span class="text-muted small">
            Gluko © Guillaume Charest 2021-2023
            <br class="d-sm-none" />
            <span class="d-none d-sm-inline">| </span>ver. {{ version }} ({{ buildDate }})
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>
