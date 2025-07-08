   describe('Booking Page', () => {
     it('loads the booking page', () => {
       cy.visit('/booking');
       cy.contains('Book Your Appointment');
     });
   });