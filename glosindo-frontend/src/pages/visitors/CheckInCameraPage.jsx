import GuestVisitPage from '../kiosk/GuestVisitPage';

/**
 * Check-In Tamu — Full Camera Direct Kiosk Mode
 * Uses the exact same biometric, reservation, existing guest, and new visitor form logic
 * as the Guest Visit Kiosk, but starts immediately in full-screen camera mode without
 * requiring the user to click "Mulai Check-In".
 */
const CheckInCameraPage = () => {
  return <GuestVisitPage directCamera={true} />;
};

export default CheckInCameraPage;
