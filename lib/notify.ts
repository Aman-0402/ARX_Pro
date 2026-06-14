// Browser-only — call from event handlers only, never during SSR/render

export async function toast(
  type: "success" | "error" | "info" | "warning",
  message: string,
  title?: string
) {
  if (typeof window === "undefined") return;
  const toastr = (await import("toastr")).default;
  toastr.options = {
    positionClass: "toast-top-right",
    timeOut: 3500,
    progressBar: true,
    closeButton: true,
    preventDuplicates: true,
    newestOnTop: true,
    showEasing: "swing",
    hideEasing: "linear",
  };
  toastr[type](message, title ?? "");
}

export async function confirmDelete(
  title = "Delete this?",
  text = "This action cannot be undone."
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const { default: Swal } = await import("sweetalert2");
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#C9A84C",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    customClass: {
      popup: "arx-swal-popup",
      title: "arx-swal-title",
    },
  });
  return result.isConfirmed;
}

export async function confirmAction(
  title: string,
  text: string,
  confirmText = "Confirm"
): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const { default: Swal } = await import("sweetalert2");
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#0A1F44",
    cancelButtonColor: "#6b7280",
    confirmButtonText: confirmText,
    cancelButtonText: "Cancel",
    reverseButtons: true,
  });
  return result.isConfirmed;
}
