// src/app/features/auth/callback/callback.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  templateUrl: './callback.component.html',
  styleUrl:    './callback.component.scss'
})
export class CallbackComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router:      Router
  ) {}

  ngOnInit(): void {
    this.authService.loadUserInfo();
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }
}
