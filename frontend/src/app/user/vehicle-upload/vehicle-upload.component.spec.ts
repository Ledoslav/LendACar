import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleUploadComponent } from './vehicle-upload.component';

describe('VehicleUploadComponent', () => {
  let component: VehicleUploadComponent;
  let fixture: ComponentFixture<VehicleUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
