import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolicitudHistorialComponent } from './solicitud-historial.component';

describe('SolicitudHistorialComponent', () => {
  let component: SolicitudHistorialComponent;
  let fixture: ComponentFixture<SolicitudHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SolicitudHistorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolicitudHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
