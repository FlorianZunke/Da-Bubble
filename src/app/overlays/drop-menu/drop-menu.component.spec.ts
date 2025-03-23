import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropMenuComponent } from './drop-menu.component';

describe('DropMenuComponent', () => {
  let component: DropMenuComponent;
  let fixture: ComponentFixture<DropMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
