// sidebar.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent }          from './sidebar';
import { provideRouter }             from '@angular/router';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture:   ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture   = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all menu items', () => {
    const links = fixture.nativeElement.querySelectorAll('.sidebar-link');
    expect(links.length).toBe(component.menuItems.length);
  });

  it('should show labels when not collapsed', () => {
    component.collapsed = false;
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('.sidebar-label');
    expect(labels.length).toBe(component.menuItems.length);
  });

  it('should hide labels when collapsed', () => {
    component.collapsed = true;
    fixture.detectChanges();
    const labels = fixture.nativeElement.querySelectorAll('.sidebar-label');
    expect(labels.length).toBe(0);
  });

  it('should add collapsed class when collapsed', () => {
    component.collapsed = true;
    fixture.detectChanges();
    const aside = fixture.nativeElement.querySelector('.sidebar');
    expect(aside.classList).toContain('collapsed');
  });

  it('should contain Dashboard menu item', () => {
    const item = component.menuItems.find(m => m.label === 'Dashboard');
    expect(item).toBeTruthy();
    expect(item?.route).toBe('/dashboard');
  });

  it('should contain Paramètres menu item', () => {
    const item = component.menuItems.find(m => m.label === 'Paramètres');
    expect(item).toBeTruthy();
    expect(item?.route).toBe('/parametres');
  });
});
