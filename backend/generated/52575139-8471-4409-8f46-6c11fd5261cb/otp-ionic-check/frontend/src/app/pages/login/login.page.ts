import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonText
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonItem, IonLabel, IonInput, IonButton, IonText],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  login = 'dieng.tech';
  password = 'dieng123';
  otpCode = '';
  error = '';

  constructor(private router: Router) {}

  async submit(): Promise<void> {
    const validPassword = this.password === 'dieng123';
    const validOtp = this.otpCode === '123456';

    if (this.login === 'dieng.tech' && (validPassword || validOtp)) {
      localStorage.setItem('stackforge_demo_user', this.login);
      await this.router.navigateByUrl('/demo');
      return;
    }

    this.error = 'Identifiants ou code OTP invalides.';
  }
}
