// callback.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CallbackComponent } from './callback';
import { AuthService } from '../../../core/services/auth.service';
import { provideRouter } from '@angular/router';

describe('CallbackComponent', () => {
  let component: CallbackComponent;
  let fixture:   ComponentFixture<CallbackComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock:      jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceMock = jasmine.createSpyObj('AuthService', ['loadUserInfo']);
    routerMock      = jasmine.createSpyObj('Router',      ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CallbackComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router,      useValue: routerMock      }
      ]
    }).compileComponents();

    fixture   = TestBed.createComponent(CallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadUserInfo on init', () => {
    expect(authServiceMock.loadUserInfo).toHaveBeenCalledOnce();
  });

  it('should redirect to /dashboard after 1 second', fakeAsync(() => {
    tick(1000);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  }));

  it('should display spinner', () => {
    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    expect(spinner).toBeTruthy();
  });
});
