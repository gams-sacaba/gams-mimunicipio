import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrl: './message-dialog.component.scss',
})
export class MessageDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string; duration?: number }
  ) {}

  ngOnInit(): void {
    const duration = this.data.duration || 60000;
    setTimeout(() => {
      this.dialogRef.close();
    }, duration);
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
