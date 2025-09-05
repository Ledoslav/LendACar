import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavedHomeComponent } from './saved-home.component';

describe('SavedHomeComponent', () => {
  let component: SavedHomeComponent;
  let fixture: ComponentFixture<SavedHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavedHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavedHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
