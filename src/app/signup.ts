import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  email = '';
  isSubmitted = false;

  constructor(private router: Router) {}

  createAccount() {
    this.isSubmitted = true;
  }

  goHome() {
    this.router.navigate(['/']);
  }
}