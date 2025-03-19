import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignedInUserComponent } from './signed-in-user.component';

describe('SignedInUserComponent', () => {
  let component: SignedInUserComponent;
  let fixture: ComponentFixture<SignedInUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignedInUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignedInUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
