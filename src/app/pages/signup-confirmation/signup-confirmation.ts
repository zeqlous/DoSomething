
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-signup-confirmation',
  imports: [],
  templateUrl: './signup-confirmation.html',
  styleUrl: './signup-confirmation.css'
})
export class SignupConfirmation {
  email: string = '';
  confirmationDate: string = new Date().toLocaleDateString();

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.email =
      this.route.snapshot.queryParamMap.get('email') ?? '';
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
