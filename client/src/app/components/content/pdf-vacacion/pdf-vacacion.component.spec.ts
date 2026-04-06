import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfVacacionComponent } from './pdf-vacacion.component';

describe('PdfVacacionComponent', () => {
  let component: PdfVacacionComponent;
  let fixture: ComponentFixture<PdfVacacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfVacacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfVacacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
