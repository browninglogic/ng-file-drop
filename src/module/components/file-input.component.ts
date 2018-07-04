import { Component, Input, Output, EventEmitter, ViewChild, forwardRef } from '@angular/core';
import { DragDropHandlerComponent } from './drag-drop-handler.component';
import { RejectionReasons } from '../models/rejection-reasons.model';
import { FileRejection } from '../models/file-rejection.model';
import * as lodash from 'lodash';

@Component({
  selector: 'nfd-file-input',
  templateUrl: './file-input.component.html'
})

export class FileInputComponent {
  /**Allowed extensions can be optionally specified as a comma-separated list*/
  @Input() allowedExtensions: string;
  /**maxFileSize can be optionally specified in bytes*/
  @Input() maxFileSize: number;
  @Output('selectionChanged') selectionChanged = new EventEmitter<File[]>();
  @Output('filesRejected') filesRejected = new EventEmitter<FileRejection[]>();
  @ViewChild('fileInput') fileInputViewChild;
  @ViewChild('dragDropHandler') dragDropHandler: DragDropHandlerComponent;
  private _selectedFiles: File[] = new Array<File>();

  /**The files which are currently selected*/
  public get selectedFiles(): File[] {
    return this._selectedFiles;
  }

  /**Tells whether or not any files are currently selected*/
  public get filesSelected(): boolean {
    return this.selectedFiles.length > 0;
  }

  /**Tells whether the user is currently dragging a file over the file-input*/
  public get draggingOver(): boolean {
    return this.dragDropHandler.draggingOver;
  }

  /**User-specified allowedExtensions as an array*/
  private get allowedExtensionsArray(): string[] {
    return this.allowedExtensions != null ? this.allowedExtensions.split(',') : null;
  }

  private get fileInput(): HTMLInputElement {
    return this.fileInputViewChild.nativeElement;
  }

  /**
   * Adds the necessary files to the selectedFiles array when dragged by the user
   * @param event the drop event provided by the browser
   */
  onFilesDropped(files: File[]) {
    this.selectFiles(files);
  }

  /**
   * Adds to selectedFiles each valid provided file and rejects invalid files,
   * where validity is defined by whether the file conflicts with any
   * user-specified maxFileSize or allowedExtensions limitation.
   * @param filesToSelect File array to iterate through for new Files to add
   */
  selectFiles(filesToSelect: File[]) {
    const rejectedFiles = new Array<FileRejection>();

    // Clear out any previous selections
    if (this.selectedFiles.length > 0) {
      this._selectedFiles = new Array<File>();
    }

    filesToSelect.forEach(file => {
      // If a maxFileSize is specified and the file is too large, then reject it.
      if (this.maxFileSize != null && file.size > this.maxFileSize) {
        rejectedFiles.push(new FileRejection(file, RejectionReasons.FileSize));
      } else if (this.allowedExtensionsArray != null &&
        // If allowed extensions are specified and the file doesn't match an allowed extension, then reject it.
        !lodash.some(this.allowedExtensionsArray, extension => file.name.endsWith('.' + extension))) {
        rejectedFiles.push(new FileRejection(file, RejectionReasons.FileType));
      } else {
        // If the file passes the validation checks, then add it to the selection array.
        this.selectedFiles.push(file);
      }
    })

    this.onSelectionChanged(this.selectedFiles);

    if (rejectedFiles.length > 0) {
      this.filesRejected.emit(rejectedFiles);
    }
  }

  /*
  When the user selects files through the file input, add them
  to selectedFiles and clear the file input
  */
  onChange() {
    this.selectFiles(Array.from(this.fileInput.files));
    this.fileInput.value = null;
  }

  public clearSelection(): void {
    if (this.selectedFiles.length > 0) {
      this._selectedFiles = new Array<File>();
      this.onSelectionChanged(this.selectedFiles);
    }
  }

  private onSelectionChanged(selectedFiles: File[]): void {
    this.selectionChanged.emit(selectedFiles);
  }
}