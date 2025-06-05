import { toast as sonnerToast } from "sonner";

export const toast = ({ title, description, variant }) => {
  const message = title + (description ? `: ${description}` : "");

  switch (variant) {
    case "destructive":
      return sonnerToast.error(message);
    case "success":
      return sonnerToast.success(message);
    default:
      return sonnerToast(message);
  }
};

export const useToast = () => {
  return { toast };
};
