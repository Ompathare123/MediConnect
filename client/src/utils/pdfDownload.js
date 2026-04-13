export const downloadPdfWithMobileSupport = async (doc, filename) => {
  const pdfBlob = doc.output("blob");
  const isMobileDevice = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent || "");

  if (isMobileDevice) {
    const canUseShare = typeof navigator !== "undefined" && navigator.canShare && navigator.share;

    if (canUseShare) {
      try {
        const file = new File([pdfBlob], filename, { type: "application/pdf" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: filename });
          return;
        }
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }
      }
    }

    const mobileUrl = URL.createObjectURL(pdfBlob);
    const opened = window.open(mobileUrl, "_blank", "noopener,noreferrer");

    if (!opened) {
      window.location.href = mobileUrl;
    }

    setTimeout(() => URL.revokeObjectURL(mobileUrl), 45000);
    return;
  }

  const desktopUrl = URL.createObjectURL(pdfBlob);
  const link = document.createElement("a");
  link.href = desktopUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(desktopUrl), 15000);
};
