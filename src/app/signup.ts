import { Component, WritableSignal, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IconComponent } from './icon';
import { Store } from './store';

type Field = 'name' | 'email' | 'password';

/** One page for both "Sign Up" (/signup) and "Log In" (/login); the route's data.mode picks which. */
@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  store = inject(Store);
  isLogin = inject(ActivatedRoute).snapshot.data['mode'] === 'login';

  name = signal('');
  email = signal('');
  password = signal('');
  showPassword = signal(false);

  touched = signal<Record<Field, boolean>>({ name: false, email: false, password: false });
  submitted = signal(false);
  busy = signal(false);
  isSubmitted = signal(false);   // account created -> show confirmation card
  formError = signal('');        // server-style error (duplicate email, wrong password)

  private show(f: Field) {
    return this.submitted() || this.touched()[f];
  }

  nameError = computed(() =>
    this.isLogin || !this.show('name') || this.name().trim() ? '' : 'Enter your name.');

  emailError = computed(() => {
    if (!this.show('email')) return '';
    if (!this.email().trim()) return 'Enter your email.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim()) ? '' : 'Enter a valid email, like name@example.com.';
  });

  passwordError = computed(() => {
    if (!this.show('password')) return '';
    if (!this.password()) return 'Enter your password.';
    return this.isLogin || this.password().length >= 6 ? '' : 'Use at least 6 characters.';
  });

  onInput(field: WritableSignal<string>, event: Event) {
    field.set((event.target as HTMLInputElement).value);
    this.formError.set('');
  }

  touch(f: Field) {
    this.touched.update(t => ({ ...t, [f]: true }));
  }

  async submit(event: Event) {
    event.preventDefault();
    this.submitted.set(true);
    if (this.nameError() || this.emailError() || this.passwordError()) return;

    this.formError.set('');
    this.busy.set(true);
    try {
      if (this.isLogin) {
        if (await this.store.login(this.email(), this.password())) {
          if (!this.store.pending()) this.store.showToast(`Welcome back, ${this.store.account()?.name}.`);
          this.store.finishSignup();
        } else {
          this.formError.set('That email and password do not match an account.');
        }
      } else {
        const result = await this.store.register(this.name().trim(), this.email(), this.password());
        if (result === 'ok') this.isSubmitted.set(true);
        else if (result === 'exists') this.formError.set('An account with that email already exists. Log in instead.');
        else this.formError.set('Could not create the account. Please try again.');
      }
    } finally {
      this.busy.set(false);
    }
  }

  /** Back button: return to the page (and event) they came from. */
  back() {
    this.store.abandonSignup();
  }

  /** After creating the account: finish the signup they started, or go home. */
  continue() {
    this.store.finishSignup();
  }

  /** After creating the account: finish any pending signup, then open the schedule. */
  goToSchedule() {
    this.store.finishSignup('/schedule');
  }
}
