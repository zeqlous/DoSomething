import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-review',
  imports: [],
  templateUrl: './registration-review.html',
  styleUrl: './registration-review.css'
})
export class RegistrationReview {

  constructor(private router: Router) {}

  cancel(): void {
    this.router.navigate(['/search']);
  }

  confirm(): void {
    this.router.navigate(['/registration-confirmation']);
  }
}
