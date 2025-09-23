import { useState, useEffect } from "react";
import { waitlistService } from "@/services/waitlist";

export const usePaymentStatus = (email) => {
  const [paymentStatus, setPaymentStatus] = useState({
    loading: true,
    paid: false,
    inWaitlist: false,
    error: null,
  });

  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (!email) {
        setPaymentStatus({
          loading: false,
          paid: false,
          inWaitlist: false,
          error: null,
        });
        return;
      }

      try {
        const status = await waitlistService.checkStatus(email);
        setPaymentStatus({
          loading: false,
          paid: status.paid,
          inWaitlist: status.in_waitlist,
          error: null,
        });
      } catch (error) {
        setPaymentStatus({
          loading: false,
          paid: false,
          inWaitlist: false,
          error: error.message,
        });
      }
    };

    checkPaymentStatus();
  }, [email]);

  return paymentStatus;
};

export default usePaymentStatus;
