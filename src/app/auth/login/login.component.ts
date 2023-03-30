import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";

@Component({
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy{
  isLoading = false;
  private authStatusSub: Subscription;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(authStatus => {
      this.isLoading = authStatus;
    });
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      console.log("login form invalid");
      return;
    }
    this.isLoading = true;
    this.authService.loginUser(form.value.email, form.value.password);

  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

}
