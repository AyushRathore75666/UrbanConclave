/* Public API addresses only. Administrator credentials are entered at sign-in and are not stored here. */
window.UGC_ADMIN_CONFIG = {
  apiBase: "https://urbangis.mp.gov.in/api/UGC",
  loginPath: "/UGCLogin",
  registrationsPath: "/GetRegistrations",
  timeoutMs: 30000,
  pageSize: 20,
  pageSizes: [10, 20, 50, 100],
};
