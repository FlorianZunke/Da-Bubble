import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSelectedUsersComponent } from './add-selected-users.component';

describe('AddSelectedUsersComponent', () => {
  let component: AddSelectedUsersComponent;
  let fixture: ComponentFixture<AddSelectedUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSelectedUsersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSelectedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
