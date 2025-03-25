import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDropMenuComponent } from './user-drop-menu.component';

describe('UserDropMenuComponent', () => {
  let component: UserDropMenuComponent;
  let fixture: ComponentFixture<UserDropMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDropMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDropMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
