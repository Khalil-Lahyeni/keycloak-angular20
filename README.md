// app.scss
$navbar-height:            3.75rem;   // 60px
$sidebar-width:            15rem;     // 240px
$sidebar-collapsed-width:  4rem;      // 64px
$breakpoint-md:            48em;      // 768px
$breakpoint-sm:            36em;      // 576px

// ── Layout global ──
.app-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.app-body {
  display: flex;
  padding-top: $navbar-height;
  min-height: calc(100vh - #{$navbar-height});
}

// ── Zone de contenu ──
.app-content {
  flex: 1;
  margin-left: $sidebar-width;
  padding: 1.5rem;
  transition: margin-left 0.25s ease;
  min-height: calc(100vh - #{$navbar-height});

  &.sidebar-collapsed {
    margin-left: $sidebar-collapsed-width;
  }

  @media (max-width: $breakpoint-md) {
    margin-left: 0 !important;
    padding: 1rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.75rem;
  }
}

// ── Overlay mobile ──
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1015;

  @media (max-width: $breakpoint-md) {
    &.active {
      display: block;
    }
  }
}
