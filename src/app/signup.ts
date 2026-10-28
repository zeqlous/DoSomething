import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from './store';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  private router = inject(Router);
  store = inject(Store);

  isSubmitted = signal(false);
  error = signal('');

  createAccount(name: string, email: string, password: string) {
    if (!name.trim() || !email.includes('@') || password.length < 6) {
      this.error.set('Enter your name, a valid email, and a password of at least 6 characters.');
      return;
    }
    this.error.set('');
    this.store.register(name.trim(), email.trim());
    this.isSubmitted.set(true);
  }

  goHome() {
    this.router.navigate(['/']);
  }
}