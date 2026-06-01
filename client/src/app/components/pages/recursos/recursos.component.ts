import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { RecursosService } from '../../../services/recursos.service';
import { SocketService } from '../../../services/socket.service';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-recursos',
  templateUrl: './recursos.component.html',
  styleUrls: ['./recursos.component.scss'],
})
export class RecursosComponent implements OnInit, OnDestroy {
  recursos: any[] = [];
  filteredRecursos: any[] = [];
  loading: boolean = true;
  searchTerm: string = '';
  selectedCategory: string = 'TODOS';
  categories: string[] = ['TODOS'];
  private socketSub!: Subscription;

  @ViewChild('tabsContainer') tabsContainer!: ElementRef;
  showScrollButtons: boolean = false;

  constructor(
    private recursosService: RecursosService,
    private socketService: SocketService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSettingsAndRecursos();
    this.socketSub = this.socketService.recursoUpdate$.subscribe(() => {
      this.loadRecursos();
    });
  }

  loadSettingsAndRecursos() {
    this.loading = true;
    this.recursosService.getSettings().subscribe({
      next: (settings) => {
        if (settings && settings.length > 0) {
          const config = settings[0];
          if (config.categoria && Array.isArray(config.categoria)) {
            this.categories = [...config.categoria];
            if (!this.categories.includes('TODOS')) {
              this.categories.push('TODOS');
            }
          }
          if (config.categoria_default) {
            this.selectedCategory = config.categoria_default;
          }
        }
        this.loadRecursos();
      },
      error: (err) => {
        console.error('Error al cargar configuraciones', err);
        this.loadRecursos();
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.checkScrollNeed(), 100);
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScrollNeed();
  }

  checkScrollNeed() {
    if (this.tabsContainer) {
      const el = this.tabsContainer.nativeElement;

      const isOverflowing = el.scrollWidth > el.clientWidth;

      this.showScrollButtons = isOverflowing;
      this.cdr.detectChanges();
    }
  }

  loadRecursos() {
    this.loading = true;
    this.recursosService.getRecursosDisponibles().subscribe({
      next: (res) => {
        this.recursos = res || [];
        this.filteredRecursos = [...this.recursos];
        this.loading = false;
        this.applyFilter();
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(
          'Error al cargar los recursos disponibles',
          'Cerrar',
          { duration: 3000 },
        );
      },
    });
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();
    this.filteredRecursos = this.recursos.filter((r) => {
      const matchSearch =
        r.titulo?.toLowerCase().includes(term) ||
        r.descripcion?.toLowerCase().includes(term) ||
        r.tipoDocumento?.toLowerCase().includes(term);

      const matchCategory =
        this.selectedCategory === 'TODOS' ||
        r.tipoDocumento?.toUpperCase() === this.selectedCategory;

      return matchSearch && matchCategory;
    });
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
    this.applyFilter();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;

    if (this.searchTerm.trim() !== '' && this.selectedCategory !== 'TODOS') {
      this.selectedCategory = 'TODOS';

      if (this.tabsContainer) {
        this.tabsContainer.nativeElement.scrollTo({
          left: 1000,
          behavior: 'smooth',
        });
      }
    }

    this.applyFilter();
  }

  scrollCategories(amount: number) {
    if (this.tabsContainer) {
      this.tabsContainer.nativeElement.scrollBy({
        left: amount,
        behavior: 'smooth',
      });
    }
  }

  download(r: any) {
    this.snackBar.open('Procesando descarga...', '', { duration: 2000 });
    this.recursosService.downloadRecurso(r._id).subscribe({
      next: (blob) => {
        if (r.formato === 'URL' && r.archivo.url_externa) {
          this.snackBar.open('Abriendo enlace externo...', '', {
            duration: 2000,
          });
          const urlApi = r.archivo.url_externa;
          window.open(urlApi, '_blank');
        } else {
          saveAs(blob, r.archivo?.nombreOriginal || 'archivo_descargado');

          if (r.metadata) {
            r.metadata.descargas = (r.metadata.descargas || 0) + 1;
          }
          this.snackBar.open('Descarga completada', 'Cerrar', {
            duration: 2000,
          });
        }
      },
      error: () => {
        this.snackBar.open('Error al descargar el archivo', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  getFileIcon(extension: string, mimetype: string): string {
    const ext = extension?.toLowerCase();
    const mime = mimetype?.toLowerCase() || '';

    if (ext === 'pdf' || mime.includes('pdf')) return 'picture_as_pdf';
    if (
      ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext) ||
      mime.includes('image')
    )
      return 'image';
    if (['mp4', 'avi', 'mkv'].includes(ext) || mime.includes('video'))
      return 'ondemand_video';
    if (['doc', 'docx'].includes(ext)) return 'description';
    if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table_chart';
    if (['zip', 'rar', '7z'].includes(ext)) return 'folder_zip';
    if (['ppt', 'pptx'].includes(ext)) return 'slideshow';

    return 'insert_drive_file';
  }

  ngOnDestroy() {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }
}
