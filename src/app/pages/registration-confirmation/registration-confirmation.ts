
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration-confirmation',
  imports: [],
  templateUrl: './registration-confirmation.html',
  styleUrl: './registration-confirmation.css'
})
export class RegistrationConfirmation {

  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }
}
