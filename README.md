// navbar.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, computed }          from '@angular/core';
import { NavbarComponent }           from './navbar';
import { AuthService }               from '../../../core/services/auth.service';
import { provideRouter }             from '@angular/router';

function createAuthMock(loggedIn = true) {
  const _user = signal(loggedIn ? { preferred_username: 'john' } : null);
  return {
    isLoggedIn: computed(() => _user() !== null),
    username:   computed(() => (_user() as any)?.preferred_username ?? ''),
    logout:     jasmine.createSpy('logout')
  };
}

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture:   ComponentFixture<NavbarComponent>;
  let authMock:  ReturnType<typeof createAuthMock>;

  beforeEach(async () => {
    authMock = createAuthMock();

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authMock }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display brand name', () => {
    const brand = fixture.nativeElement.querySelector('.navbar-brand');
    expect(brand.textContent).toContain('Fleet Management');
  });

  it('should display username when logged in', () => {
    const content = fixture.nativeElement.textContent;
    expect(content).toContain('john');
  });

  it('should show avatar with first letter of username', () => {
    const avatar = fixture.nativeElement.querySelector('.avatar-circle');
    expect(avatar.textContent.trim()).toBe('J');
  });

  it('should emit toggleSidebar when button clicked', () => {
    spyOn(component.toggleSidebar, 'emit');
    const btn = fixture.nativeElement.querySelector('.toggle-btn');
    btn.click();
    expect(component.toggleSidebar.emit).toHaveBeenCalled();
  });

  it('should call logout when button clicked', () => {
    const btn = fixture.nativeElement.querySelector('.btn-outline-danger');
    btn.click();
    expect(authMock.logout).toHaveBeenCalled();
  });
});
