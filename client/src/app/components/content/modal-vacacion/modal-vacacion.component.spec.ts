import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalVacacionComponent } from './modal-vacacion.component';

describe('ModalVacacionComponent', () => {
  let component: ModalVacacionComponent;
  let fixture: ComponentFixture<ModalVacacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalVacacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalVacacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
