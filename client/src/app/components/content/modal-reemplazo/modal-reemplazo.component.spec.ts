import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReemplazoComponent } from './modal-reemplazo.component';

describe('ModalReemplazoComponent', () => {
  let component: ModalReemplazoComponent;
  let fixture: ComponentFixture<ModalReemplazoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalReemplazoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalReemplazoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
