import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgetPasswordPagePage } from './forget-password-page.page';

describe('ForgetPasswordPagePage', () => {
  let component: ForgetPasswordPagePage;
  let fixture: ComponentFixture<ForgetPasswordPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgetPasswordPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
