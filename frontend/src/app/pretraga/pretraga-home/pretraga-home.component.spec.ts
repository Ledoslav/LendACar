import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PretragaHomeComponent } from './pretraga-home.component';

describe('PretragaHomeComponent', () => {
  let component: PretragaHomeComponent;
  let fixture: ComponentFixture<PretragaHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PretragaHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PretragaHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
