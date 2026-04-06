import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFechaComponent } from './form-fecha.component';

describe('FormFechaComponent', () => {
  let component: FormFechaComponent;
  let fixture: ComponentFixture<FormFechaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormFechaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormFechaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
