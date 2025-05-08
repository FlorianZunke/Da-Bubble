import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})


export class ToggleService {
  private _showSidebar = true;
  get showSidebar() { return this._showSidebar; }
  toggleSidebar() { this._showSidebar = !this._showSidebar; }
}
