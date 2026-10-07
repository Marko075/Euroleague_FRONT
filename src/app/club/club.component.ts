import { Component } from '@angular/core';
import { ClubService } from 'services/club.service';

@Component({
  selector: 'club',
  templateUrl: './club.component.html',
  styleUrls: ['./club.component.scss']
})
export class ClubComponent {

  clubs$ = this.clubService.getAll();

  constructor(private clubService: ClubService) {}

  getLogoClub(nom: string): string {
    const logos: Record<string, string> = {
      'Panathinaikos AKTOR': 'panathinaikos_aktor.webp',
      'Partizan Mozzart Bet': 'partizan_mozzart_bet.webp',
      'Paris Basketball': 'paris_basketball.webp',
      'Fenerbahçe Beko': 'fenerbahce_beko.webp',
      'FC Bayern Munich': 'bayern_munich.webp'
    };

    return 'assets/logo_club/' + logos[nom];
  }
}

