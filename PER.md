<!-- app.html -->
<div class="app-container">

  <!-- ── Top Navbar (fixe) ── -->
  <app-navbar (toggleSidebar)="onToggleSidebar()"></app-navbar>

  <div class="app-body">

    <!-- ── Sidebar (fixe à gauche) ── -->
    <app-sidebar [collapsed]="sidebarCollapsed"></app-sidebar>

    <!-- ── Contenu principal ── -->
    <main
      class="app-content"
      [class.sidebar-collapsed]="sidebarCollapsed">
      <router-outlet />
    </main>

  </div>

  <!-- ── Global Loading Spinner ── -->
  <app-loading-spinner />

</div>
