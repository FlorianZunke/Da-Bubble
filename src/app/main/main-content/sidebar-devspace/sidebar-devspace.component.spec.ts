import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarDevspaceComponent } from './sidebar-devspace.component';

describe('SidebarDevspaceComponent', () => {
  let component: SidebarDevspaceComponent;
  let fixture: ComponentFixture<SidebarDevspaceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarDevspaceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarDevspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
