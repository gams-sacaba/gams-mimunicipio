import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private updateSubject = new Subject<void>();
  update$ = this.updateSubject.asObservable();

  updateElement() {
    this.updateSubject.next();
  }
}
