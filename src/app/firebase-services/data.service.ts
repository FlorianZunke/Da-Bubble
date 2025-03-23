import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  sidebarDevspaceIsVisible: boolean = true;

  constructor() { }
}
