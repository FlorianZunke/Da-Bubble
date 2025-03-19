import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleSidebarDevspaceComponent } from './toggle-sidebar-devspace.component';

describe('ToggleSidebarDevspaceComponent', () => {
  let component: ToggleSidebarDevspaceComponent;
  let fixture: ComponentFixture<ToggleSidebarDevspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleSidebarDevspaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToggleSidebarDevspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
