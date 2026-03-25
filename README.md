<!-- navbar.html -->
<nav class="navbar navbar-light bg-white border-bottom px-3 top-navbar">

  <!-- ── Gauche : Toggle + Logo ── -->
  <div class="d-flex align-items-center gap-2">
    <button
      class="btn btn-light btn-sm toggle-btn"
      (click)="onToggleSidebar()"
      title="Toggle Sidebar">
      <i class="bi bi-list fs-5"></i>
    </button>
    <span class="navbar-brand mb-0 fw-bold text-primary">
      🚗 <span class="d-none d-sm-inline">Fleet Management</span>
    </span>
  </div>

  <!-- ── Droite : User + Logout ── -->
  <div class="d-flex align-items-center gap-2" *ngIf="authService.isLoggedIn()">

    <!-- Avatar + nom -->
    <div class="d-flex align-items-center gap-2">
      <div class="avatar-circle bg-primary text-white">
        {{ authService.username().charAt(0).toUpperCase() }}
      </div>
      <span class="fw-semibold text-dark username-text">
        {{ authService.username() }}
      </span>
    </div>

    <!-- Bouton logout -->
    <button
      class="btn btn-outline-danger btn-sm"
      (click)="authService.logout()">
      <i class="bi bi-box-arrow-right"></i>
      <span class="logout-text ms-1">Déconnexion</span>
    </button>

  </div>

</nav>
