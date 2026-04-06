import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormVacacionComponent } from './form-vacacion.component';

describe('FormVacacionComponent', () => {
  let component: FormVacacionComponent;
  let fixture: ComponentFixture<FormVacacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormVacacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormVacacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
