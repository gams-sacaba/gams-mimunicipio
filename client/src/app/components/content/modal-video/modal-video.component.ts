import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-modal-video',
  templateUrl: './modal-video.component.html',
  styleUrl: './modal-video.component.scss',
})
export class ModalVideoComponent implements OnInit {
  safeUrl: SafeResourceUrl | null = null;

  constructor(
    public dialogRef: MatDialogRef<ModalVideoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    if (this.data && this.data.videoUrl) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.data.videoUrl,
      );
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
