<script setup lang="ts"></script>
<template>
  <footer class="footer mt-auto py-3 bg-dark">
    <div class="container">
      <div class="row">
        <div class="col">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-toggle="modal"
            data-bs-target="#experiment"
          >
            {{ $t('Display Notice') }}
          </button>
          <Teleport to="body">
            <div
              class="modal modal-fullscreen-md-down fade"
              id="experiment"
              tabindex="-1"
              aria-hidden="false"
            >
              <div class="modal-dialog bg-light">
                <div class="modal-header">
                  <h5 class="modal-title" id="experimentLabel">
                    {{ $t('Notice') }}
                  </h5>
                </div>
                <div class="modal-body">
                  <div class="row">
                    <div class="col">
                      <p>{{ $t('Experiment Notice') }}</p>
                    </div>
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">
                    {{ $t('Close') }}
                  </button>
                </div>
              </div>
            </div>
          </Teleport>
        </div>
      </div>
      <div class="row">
        <div class="col">
          <span class="text-light">Gluko © Guillaume Charest 2021-2023</span>
        </div>
      </div>
    </div>
  </footer>
</template>
