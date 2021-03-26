<template>
  <div class="skippy visually-hidden-focusable overflow-hidden">
    <div class="container-xl">
      <a class="d-inline-flex p-2 m-1" href="#content">
        {{ $t("navigation.skipToContent") }}
      </a>
    </div>
  </div>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand visually-hidden-focusable" href="#">{{
        $t("navigation.mainNavigation")
      }}</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/" class="nav-link" aria-current="page">{{
              $t("navigation.home")
            }}</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link"
              >{{ $t("about.title") }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <main>
    <router-view />
  </main>
</template>
