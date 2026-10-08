/* Talks to the Urban Conclave APIs. A missing or rejected token never returns registration records. */
(function (global) {
  const config = global.UGC_ADMIN_CONFIG;

  class ApiError extends Error {
    constructor(kind, message, httpStatus) {
      super(message);
      this.name = "ApiError";
      this.kind = kind;
      this.httpStatus = httpStatus || 0;
    }
  }

  function messageFrom(payload, fallback) {
    if (payload && typeof payload.message === "string" && payload.message.trim()) return payload.message.trim();
    return fallback;
  }

  async function post(path, payload, authenticated) {
    const token = authenticated ? global.UgcAdminSession.getToken() : "";
    if (authenticated && !token) {
      throw new ApiError("unauthorized", "Your session has ended. Please sign in again.", 401);
    }

    const controller = new AbortController();
    const timer = global.setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      const headers = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = "Bearer " + token;

      let response;
      try {
        response = await fetch(config.apiBase + path, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          signal: controller.signal,
          cache: "no-store",
          credentials: "omit",
          mode: "cors",
          referrerPolicy: "no-referrer",
        });
      } catch (error) {
        if (error && error.name === "AbortError") {
          throw new ApiError("timeout", "The request timed out. Please try again.");
        }
        throw new ApiError("network", "Unable to reach the server. Check your connection and try again.");
      }

      const body = await response.json().catch(() => null);
      const valid = Boolean(body) && typeof body === "object" && !Array.isArray(body);
      if (!valid) {
        if (response.status === 401 || response.status === 403) {
          throw new ApiError(
            authenticated ? "unauthorized" : "rejected",
            authenticated ? "Your session has ended. Please sign in again." : "Sign-in could not be completed.",
            response.status,
          );
        }
        if (response.status >= 500) {
          throw new ApiError("server", "The server could not complete this request. Please try again.", response.status);
        }
        if (response.status === 400) {
          throw new ApiError("bad-request", "The request could not be processed.", response.status);
        }
        throw new ApiError("malformed", "The server returned an unexpected response.", response.status);
      }

      if (response.status === 401 || response.status === 403) {
        throw new ApiError(
          authenticated ? "unauthorized" : "rejected",
          messageFrom(body, authenticated ? "Your session has ended. Please sign in again." : "Sign-in could not be completed."),
          response.status,
        );
      }

      if (body.status === false) {
        throw new ApiError("rejected", messageFrom(body, "The request could not be completed."), response.status);
      }

      if (response.status >= 500) {
        throw new ApiError("server", messageFrom(body, "The server could not complete this request. Please try again."), response.status);
      }

      if (response.status === 400) {
        throw new ApiError("bad-request", messageFrom(body, "The request could not be processed."), response.status);
      }

      if (!response.ok || body.status !== true) {
        throw new ApiError("malformed", messageFrom(body, "The server returned an unexpected response."), response.status);
      }

      return body;
    } finally {
      global.clearTimeout(timer);
    }
  }

  function blankToNull(value) {
    const text = String(value ?? "").trim();
    return text ? text : null;
  }

  async function login(userId, password) {
    const body = await post(config.loginPath, { userId, password }, false);
    if (typeof body.token !== "string" || !body.token.trim()) {
      throw new ApiError("malformed", "The server returned an unexpected response.");
    }
    return body;
  }

  async function getRegistrations(filters) {
    const body = await post(
      config.registrationsPath,
      {
        fullName: blankToNull(filters.fullName),
        mobileNumber: blankToNull(filters.mobileNumber),
        emailId: blankToNull(filters.emailId),
      },
      true,
    );

    if (!Array.isArray(body.data) || typeof body.totalRecords !== "number" || !Number.isFinite(body.totalRecords)) {
      throw new ApiError("malformed", "The server returned an unexpected response.");
    }

    return {
      message: typeof body.message === "string" ? body.message : "",
      totalRecords: body.totalRecords,
      rows: body.data.filter((row) => row && typeof row === "object" && !Array.isArray(row)),
    };
  }

  async function updateRegistrationStatus(registrationId, approved, updatedBy) {
    const id = String(registrationId || "").trim();
    const actor = String(updatedBy || "").trim();
    if (!id || !actor) {
      throw new ApiError("bad-request", "The request could not be processed.");
    }
    return post(
      config.statusPath,
      {
        registrationId: id,
        registrationStatus: approved ? "Confirmed" : "Pending",
        cm_meeting_approval: approved ? "Yes" : "No",
        updatedBy: actor,
      },
      true,
    );
  }

  global.UgcAdminApi = { login, getRegistrations, updateRegistrationStatus, ApiError };
})(window);
