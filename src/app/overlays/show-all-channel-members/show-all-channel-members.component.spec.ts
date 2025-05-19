import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowAllChannelMembersComponent } from './show-all-channel-members.component';

describe('ShowAllChannelMembersComponent', () => {
  let component: ShowAllChannelMembersComponent;
  let fixture: ComponentFixture<ShowAllChannelMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowAllChannelMembersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowAllChannelMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
