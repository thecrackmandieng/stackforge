import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  login = 'dieng.tech';
  password = 'dieng123';
  otpCode = '';
  error = '';

  constructor(private router: Router) {}

  submit(): void {
    const validPassword = this.password === 'dieng123';
    const validOtp = this.otpCode === '123456';

    if (this.login === 'dieng.tech' && (validPassword || validOtp)) {
      void this.router.navigateByUrl('/demo');
      return;
    }

    this.error = 'Identifiants ou code OTP invalides.';
  }
}
