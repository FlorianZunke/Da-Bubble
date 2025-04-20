import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-emoji-picker-dialog',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="dialog-container">
      <!-- Hier werden Such- und Kategorie-Optionen über Attribute aktiviert -->
      <emoji-picker show-search show-preview theme="light"></emoji-picker>
      <button class="close-button" (click)="close()">Schließen</button>
    </div>
  `,
  styles: [
    `
      .dialog-container {
        padding: 1rem;
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        text-align: center;
        max-height: 80vh;
        overflow-y: auto;
      }
      .close-button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background-color: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `,
  ],
})
export class EmojiPickerDialogComponent {
  constructor(private dialogRef: MatDialogRef<EmojiPickerDialogComponent>) {}

  selectEmoji(event: any): void {
    // Diese Methode wird aufgerufen, wenn ein Emoji geklickt wird.
    // Falls du ein eigenes Event Handling brauchst, kannst du es hier erweitern.
    const emoji = event.detail.unicode || event.detail.emoji;
    this.dialogRef.close(emoji);
  }

  close(): void {
    this.dialogRef.close();
  }
}
