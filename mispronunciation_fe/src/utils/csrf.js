export function getCSRFToken() {
  console.log("inside function");
  console.log("Current cookies:", document.cookie); // Log all cookies

  const csrfEntry = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken"));

  console.log("CSRF entry found:", csrfEntry); // Log the found entry

  return csrfEntry ? csrfEntry.split("=")[1] : "";
}
