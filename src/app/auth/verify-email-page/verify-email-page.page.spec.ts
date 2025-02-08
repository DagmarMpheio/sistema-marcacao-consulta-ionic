import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyEmailPagePage } from './verify-email-page.page';

describe('VerifyEmailPagePage', () => {
  let component: VerifyEmailPagePage;
  let fixture: ComponentFixture<VerifyEmailPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyEmailPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
