import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormHoraComponent } from './form-hora.component';

describe('FormHoraComponent', () => {
  let component: FormHoraComponent;
  let fixture: ComponentFixture<FormHoraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormHoraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormHoraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
