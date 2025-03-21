import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelOverlayComponent } from './channel-overlay.component';

describe('ChannelOverlayComponent', () => {
  let component: ChannelOverlayComponent;
  let fixture: ComponentFixture<ChannelOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelOverlayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChannelOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
