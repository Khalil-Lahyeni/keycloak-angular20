// navbar.scss
$navbar-height: 3.75rem;  // 60px
$breakpoint-sm: 36em;     // 576px

.top-navbar {
  height: $navbar-height;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1030;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.08);
}

.toggle-btn {
  border: none;
  background: transparent;
  color: #6c757d;

  &:hover {
    background: #f0f0f0;
    color: #333;
  }
}

.avatar-circle {
  width: 2.125rem;     // 34px
  height: 2.125rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}

// ── Mobile : masquer le nom ──
.username-text {
  @media (max-width: $breakpoint-sm) {
    display: none !important;
  }
}

// ── Mobile : masquer le texte logout ──
.logout-text {
  @media (max-width: $breakpoint-sm) {
    display: none !important;
  }
}

// ── Mobile : réduire padding navbar ──
@media (max-width: $breakpoint-sm) {
  .top-navbar {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
}
