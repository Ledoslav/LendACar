import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { ReservationDto } from '../../Models/ReservationDto';
import jsPDF from 'jspdf';
import { DatePipe } from '@angular/common';

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
          console.error('Failed to load reservation', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.loading = false;
    }
  }

  downloadPdf(): void {
    console.log('Download PDF clicked');
    if (!this.reservation) {
      console.warn('No reservation data available for PDF');
      return;
    }

    try {
      const doc = new jsPDF();
      const r = this.reservation;
      const v = r.vehicle;
      const owner = r.owner;
      
      console.log('Generating PDF for reservation:', r.id);

    // Header
    doc.setFontSize(22);
    doc.setTextColor(52, 152, 219); // Blue
    doc.text('LendACar Reservation Summary', 105, 20, { align: 'center' });
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 25, 190, 25);

    // Reservation info
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Reservation Details', 20, 40);
    
    doc.setFontSize(12);
    doc.text(`Reservation ID: #REC-${r.id}`, 20, 50);
    doc.text(`Status: Pending Confirmation`, 20, 58);
    doc.text(`Total Price: ${r.price} KM`, 20, 66);
    doc.text(`Pick-up: ${this.formatDate(r.pickUpDateTime)} at ${r.pickUpCity?.name}`, 20, 74);
    doc.text(`Drop-off: ${this.formatDate(r.dropOffDateTime)} at ${r.dropOffCity?.name}`, 20, 82);

    // Vehicle info
    doc.setFontSize(16);
    doc.text('Vehicle Information', 20, 100);
    
    doc.setFontSize(12);
    doc.text(`Vehicle: ${v?.title}`, 20, 110);
    doc.text(`Category: ${v?.vehicleCategory?.name || 'N/A'}`, 20, 118);

    // Owner info
    doc.setFontSize(16);
    doc.text('Owner Contact Details', 20, 136);
    
    doc.setFontSize(12);
    doc.text(`Owner: ${owner?.firstName} ${owner?.lastName}`, 20, 146);
    doc.text(`Phone: ${owner?.phoneNumber || 'N/A'}`, 20, 154);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for choosing LendACar!', 105, 280, { align: 'center' });

    doc.save(`Reservation-${r.id}.pdf`);
    console.log('PDF saved');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  private formatDate(date: string): string {
    return this.datePipe.transform(date, 'mediumDate') || date;
  }

  goToDashboard(): void {
    console.log('Go to Dashboard clicked');
    this.router.navigate(['/public/home']);
  }
}
