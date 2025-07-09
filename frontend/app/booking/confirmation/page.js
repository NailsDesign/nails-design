import Link from "next/link";

export default function BookingConfirmation() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-pink-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-pink-600 mb-4">Thank You for Your Booking!</h1>
        <p className="text-gray-700 mb-6">
          Your appointment has been successfully booked. We look forward to seeing you soon!
        </p>
        <p className="text-gray-500 mb-8">
          You will receive a confirmation email with your booking details. If you have any questions, feel free to contact us.
        </p>
        <Link href="/">
          <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-6 rounded transition-colors">
            Return to Home
          </button>
        </Link>
      </div>
    </div>
  );
} 