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
  error = '';

  constructor(private router: Router) {}

  submit(): void {
    if (this.login === 'dieng.tech' && this.password === 'dieng123') {
      void this.router.navigateByUrl('/demo');
      return;
    }

    this.error = 'Identifiants invalides.';
  }
}
