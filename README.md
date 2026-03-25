<!-- sidebar.html -->
<aside
  class="sidebar bg-white border-end"
  [class.collapsed]="collapsed"
  [class.mobile]="isMobile">

  <nav class="sidebar-nav mt-2">
    <ul class="nav flex-column px-2">

      <li class="nav-item" *ngFor="let item of menuItems">
        <a
          class="nav-link sidebar-link d-flex align-items-center gap-3 rounded"
          [routerLink]="item.route"
          routerLinkActive="active">

          <i class="bi {{ item.icon }} fs-5 flex-shrink-0"></i>

          <span class="sidebar-label" *ngIf="!collapsed || isMobile">
            {{ item.label }}
          </span>

        </a>
      </li>

    </ul>
  </nav>

</aside>
