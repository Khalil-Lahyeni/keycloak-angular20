<!-- sidebar.html -->
<aside class="sidebar d-flex flex-column">

  <!-- ── Logo ── -->
  <div class="sidebar-logo">
    <span class="logo-icon">🚗</span>
    <span class="logo-text">Fleet</span>
  </div>

  <hr class="sidebar-divider" />

  <!-- ── Navigation ── -->
  <nav class="sidebar-nav flex-grow-1">
    <ul class="nav flex-column gap-1">
      <li class="nav-item" *ngFor="let item of navItems">
        <a
          class="nav-link sidebar-link"
          [routerLink]="item.route"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }">
          <i class="bi {{ item.icon }} sidebar-icon"></i>
          <span class="sidebar-label">{{ item.label }}</span>
        </a>
      </li>
    </ul>
  </nav>

  <hr class="sidebar-divider" />

  <!-- ── User + Logout ── -->
  <div class="sidebar-footer">
    <div class="sidebar-user">
      <i class="bi bi-person-circle sidebar-icon"></i>
      <span class="sidebar-label">{{ username() }}</span>
    </div>
    <button class="sidebar-logout" (click)="logout()">
      <i class="bi bi-box-arrow-left sidebar-icon"></i>
      <span class="sidebar-label">Sign out</span>
    </button>
  </div>

</aside>
