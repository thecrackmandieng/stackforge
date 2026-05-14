import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

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
  otpRecipient = '';
  otpCode = '';
  otpMessage = '';
  otpSending = false;
  error = '';

  constructor(private router: Router) {}

  async requestOtp(): Promise<void> {
    this.error = '';
    this.otpMessage = '';
    this.otpSending = true;

    try {
      const response = await fetch(`${environment.apiUrl}/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: this.otpRecipient })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Envoi OTP impossible.');
      }

      this.otpMessage = result.message;
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Envoi OTP impossible.';
    } finally {
      this.otpSending = false;
    }
  }

  async submit(): Promise<void> {
    const validPassword = this.password === 'dieng123';

    if (this.login === 'dieng.tech' && validPassword) {
      void this.router.navigateByUrl('/demo');
      return;
    }

    if (this.otpRecipient && this.otpCode) {
      try {
        const response = await fetch(`${environment.apiUrl}/auth/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipient: this.otpRecipient, code: this.otpCode })
        });

        if (!response.ok) {
          const result = await response.json().catch(() => null);
          throw new Error(result?.message || 'Code OTP invalide.');
        }

        void this.router.navigateByUrl('/demo');
        return;
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Code OTP invalide.';
        return;
      }
    }

    this.error = 'Utilise le mot de passe demo ou un code OTP envoye.';
  }
}
