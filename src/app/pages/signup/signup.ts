import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }
  
  email: string = '';

  createAccount(): void {
    this.router.navigate(['/signup-confirmation'], {
      queryParams: { email: this.email }
    });
  }
}