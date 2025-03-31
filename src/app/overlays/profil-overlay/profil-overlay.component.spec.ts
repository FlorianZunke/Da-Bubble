import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilOverlayComponent } from './profil-overlay.component';

describe('ProfilOverlayComponent', () => {
  let component: ProfilOverlayComponent;
  let fixture: ComponentFixture<ProfilOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
