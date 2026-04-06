import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ModalVideoComponent } from '../../content/modal-video/modal-video.component';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrl: './help.component.scss',
})
export class HelpComponent {
  tutoriales = [
    {
      titulo: 'Inicio de Sesión',
      descripcion:
        'Instrucciones para el acceso seguro al sistema y recuperación de credenciales.',
      thumbnail: 'assets/img/thumb-login.jpg',
      videoUrl: 'https://www.youtube.com/embed/sHrFsepvou0',
    },
    {
      titulo: 'Cómo solicitar excepción',
      descripcion:
        'Tutorial para el registro de excepciones de tickeo y regularización de asistencia.',
      thumbnail: 'assets/img/thumb-excepcion.jpg',
      videoUrl: 'https://www.youtube.com/embed/eLbEp9GehWU',
    },
    {
      titulo: 'Cómo solicitar permisos',
      descripcion:
        'Guía paso a paso para gestionar permisos, vacaciones y bajas médicas del sistema.',
      thumbnail: 'assets/img/thumb-permisos.jpg',
      videoUrl: 'https://www.youtube.com/embed/DWxHwRCQ5JM',
    },
    {
      titulo: 'Módulo de Aprobadores',
      descripcion:
        'Instrucciones para jefes sobre la revisión y gestión de solicitudes del personal.',
      thumbnail: 'assets/img/thumb-aprobador.jpg',
      videoUrl: 'https://www.youtube.com/embed/hQ-Dt1ylsf4',
    },
  ];

  constructor(private dialog: MatDialog) {}

  descargarManual() {
    window.open('assets/docs/manualUsuarioMiMunicipio.pdf', '_blank');
  }

  reproducirVideo(video: any) {
    this.dialog.open(ModalVideoComponent, {
      width: '800px',
      data: video,
    });
  }
}
