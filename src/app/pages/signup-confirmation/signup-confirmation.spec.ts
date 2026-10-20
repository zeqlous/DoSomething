import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupConfirmation } from './signup-confirmation';

describe('SignupConfirmation', () => {
  let component: SignupConfirmation;
  let fixture: ComponentFixture<SignupConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupConfirmation],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupConfirmation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
