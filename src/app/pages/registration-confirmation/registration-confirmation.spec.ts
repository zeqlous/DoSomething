import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationConfirmation } from './registration-confirmation';

describe('RegistrationConfirmation', () => {
  let component: RegistrationConfirmation;
  let fixture: ComponentFixture<RegistrationConfirmation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationConfirmation],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistrationConfirmation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
