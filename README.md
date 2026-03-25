// sidebar.scss
$sidebar-width:            15rem;    // 240px
$sidebar-collapsed-width:  4rem;     // 64px
$navbar-height:            3.75rem;  // 60px
$breakpoint-md:            48em;     // 768px

.sidebar {
  position: fixed;
  top: $navbar-height;
  left: 0;
  bottom: 0;
  width: $sidebar-width;
  overflow-x: hidden;
  overflow-y: auto;
  transition: width 0.25s ease, transform 0.25s ease;
  z-index: 1020;
  box-shadow: 0.125rem 0 0.5rem rgba(0, 0, 0, 0.06);
  background: #fff;

  // ── Desktop collapsed ──
  &.collapsed:not(.mobile) {
    width: $sidebar-collapsed-width;

    .sidebar-label {
      opacity: 0;
      pointer-events: none;
      width: 0;
    }
  }

  // ── Mobile : slide in/out ──
  &.mobile {
    width: $sidebar-width;

    &.collapsed {
      transform: translateX(-100%);
    }

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }
}

// ── Navigation ──
.sidebar-nav {
  padding-top: 0.5rem;
}

.sidebar-link {
  color: #495057;
  padding: 0.625rem 0.75rem;   // 10px 12px
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;

  &:hover {
    background: #f0f4ff;
    color: #0d6efd;
    i { color: #0d6efd; }
  }

  &.active {
    background: #e8efff;
    color: #0d6efd;
    font-weight: 600;
    i { color: #0d6efd; }
  }

  i {
    color: #6c757d;
    transition: color 0.15s;
    min-width: 1.25rem;   // 20px
    text-align: center;
  }
}

.sidebar-label {
  transition: opacity 0.2s ease, width 0.2s ease;
  overflow: hidden;
}
