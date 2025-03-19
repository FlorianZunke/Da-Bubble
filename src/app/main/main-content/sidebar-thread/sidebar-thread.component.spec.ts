import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarThreadComponent } from './sidebar-thread.component';

describe('SidebarThreadComponent', () => {
  let component: SidebarThreadComponent;
  let fixture: ComponentFixture<SidebarThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarThreadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
