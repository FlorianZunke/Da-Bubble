import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAllUsersComponent } from './add-all-users.component';

describe('AddAllUsersComponent', () => {
  let component: AddAllUsersComponent;
  let fixture: ComponentFixture<AddAllUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAllUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddAllUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
