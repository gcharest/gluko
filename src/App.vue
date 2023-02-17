<script setup lang="ts">
import BaseFooter from "@/components/BaseFooter.vue";
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <header>
    <a class="visually-hidden-focusable" href="#content">
      {{ $t("navigation.skipToContent") }}
    </a>
    <nav class="navbar navbar-expand-md navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">Gluko</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarMain">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/">{{ $t("home") }}</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/about">{{
                $t("about")
              }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <RouterView />
  <BaseFooter />
</template>
