import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AravindDashboardComponent } from './aravind-dashboard.component';

describe('AravindDashboardComponent', () => {
  let component: AravindDashboardComponent;
  let fixture: ComponentFixture<AravindDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AravindDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AravindDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
