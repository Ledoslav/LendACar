import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { ReservationDto } from '../../Models/ReservationDto';
import jsPDF from 'jspdf';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  standalone: false,
  selector: 'app-reservation-success',
  templateUrl: './reservation-success.component.html',
  styleUrls: ['./reservation-success.component.css'],
  providers: [DatePipe]
})
export class ReservationSuccessComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private datePipe = inject(DatePipe);
  private translate = inject(TranslateService);

  reservation: ReservationDto | null = null;
  loading = true;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? +idParam : null;

    if (id) {
      this.reservationService.getById(id).subscribe({
        next: (res) => {
          this.reservation = res;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loading = false;
    }
  }

  downloadPdf(): void {
    if (!this.reservation) {

      return;
    }

    try {
      const doc = new jsPDF();
      const r = this.reservation;
      const v = r.vehicle;
      const owner = r.owner;
      


    // Header
    doc.setFontSize(22);
    doc.setTextColor(52, 152, 219); // Blue
    doc.text(this.translate.instant('RESERVATION.PDF.SUMMARY_TITLE'), 105, 20, { align: 'center' });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 25, 190, 25);

    // Reservation info
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(this.translate.instant('RESERVATION.SUCCESS.DETAILS_TITLE'), 20, 40);
    
    doc.setFontSize(12);
    doc.text(`${this.translate.instant('RESERVATION.SUCCESS.ID')}: #REC-${r.id}`, 20, 50);
    doc.text(this.translate.instant('RESERVATION.PDF.STATUS_PENDING'), 20, 58);
    doc.text(`${this.translate.instant('RESERVATION.SUCCESS.TOTAL_PRICE')}: ${r.price} KM`, 20, 66);
    doc.text(`${this.translate.instant('RESERVATION.PDF.PICKUP')}: ${this.formatDate(r.pickUpDateTime)} at ${r.pickUpCity?.name}`, 20, 74);
    doc.text(`${this.translate.instant('RESERVATION.PDF.DROPOFF')}: ${this.formatDate(r.dropOffDateTime)} at ${r.dropOffCity?.name}`, 20, 82);

    // Vehicle info
    doc.setFontSize(16);
    doc.text(this.translate.instant('RESERVATION.PDF.VEHICLE_INFO'), 20, 100);
    
    doc.setFontSize(12);
    doc.text(`${this.translate.instant('VEHICLE.LISTING.MODEL')}: ${v?.title}`, 20, 110);
    doc.text(`${this.translate.instant('RESERVATION.SUCCESS.CATEGORY')}: ${v?.vehicleCategory?.name || 'N/A'}`, 20, 118);

    // Owner info
    doc.setFontSize(16);
    doc.text(this.translate.instant('RESERVATION.PDF.OWNER_DETAILS'), 20, 136);
    
    doc.setFontSize(12);
    doc.text(`${this.translate.instant('VEHICLE.LISTING.OWNER')}: ${owner?.firstName} ${owner?.lastName}`, 20, 146);
    doc.text(`${this.translate.instant('COMPANY.PHONE')}: ${owner?.phoneNumber || 'N/A'}`, 20, 154);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(this.translate.instant('RESERVATION.PDF.THANK_YOU'), 105, 280, { align: 'center' });

    doc.save(`Reservation-${r.id}.pdf`);
    } catch (error) {

    }
  }

  private formatDate(date: string): string {
    return this.datePipe.transform(date, 'mediumDate') || date;
  }

  goToDashboard(): void {
    this.router.navigate(['/public/home']);
  }
}
