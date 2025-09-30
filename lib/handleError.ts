import { toast } from "sonner";

export function handleError(error: unknown, context: string = "Error") {
  let message = "Something went wrong.";

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  // Log to console for debugging
  console.error(`[${context}]`, error);

  // Show toast
  toast.error(`${context}: ${message}`);
}
