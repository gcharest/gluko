<template>
  <button type="button" class="btn btn-link nav-link" data-bs-toggle="modal" data-bs-target="#experiment-modal">
    <i class="bi bi-exclamation-circle"></i>
    <span class="d-lg-none ms-2">
      {{ $t('notices.experimental.display') }}
    </span>
  </button>
  <Teleport to="body">
    <div id="experiment-modal" class="modal modal-lg fade" tabindex="-1" aria-labelledby="experiment-modal"
      aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="experimentLabel" class="modal-title">
              {{ $t('notices.experimental.label') }}
            </h5>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col">
                <p>{{ $t('notices.experimental.message') }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" data-bs-target="#experiment-modal">
              {{ $t('common.actions.close') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
