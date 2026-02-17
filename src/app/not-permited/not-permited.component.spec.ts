import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotPermitedComponent } from './not-permited.component';

describe('NotPermitedComponent', () => {
  let component: NotPermitedComponent;
  let fixture: ComponentFixture<NotPermitedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotPermitedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotPermitedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
