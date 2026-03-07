import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  standalone: false,
  selector: 'language-selector',
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.css'
})
export class LanguageSelectorComponent {
  languages = [
    {code: 'en', label: 'English'},
    {code: 'bs', label: 'Bosanski'}
  ];

  constructor(private translate: TranslateService) {
    // Postavi default jezik
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  changeLanguage($event:any): void {
    this.translate.use($event.target.value); // Promjena jezika u hodu
  }
}
