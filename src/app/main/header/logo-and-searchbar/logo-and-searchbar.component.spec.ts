import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoAndSearchbarComponent } from './logo-and-searchbar.component';

describe('LogoComponent', () => {
  let component: LogoAndSearchbarComponent;
  let fixture: ComponentFixture<LogoAndSearchbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoAndSearchbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoAndSearchbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
