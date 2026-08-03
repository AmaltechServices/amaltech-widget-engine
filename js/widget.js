(function () {
  "use strict";

  const HOST_ID = "teamair-tiktok-live-widget";
  const currentScript =
  document.currentScript ||
  [...document.scripts].find((script) =>
    script.src.includes("/js/widget.js")
  );

const client =
  currentScript?.dataset?.client?.trim().toLowerCase() || "teamair";

const CONFIG_URL =
  `https://widget.amaltech.com.my/config/${client}.json`;
  if (document.getElementById(HOST_ID)) return;

  function getMalaysiaNow() {
    return new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kuala_Lumpur"
      })
    );
  }

  function createDateTime(date, time) {
    return new Date(`${date}T${time}:00`);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function tiktokLogo(size = 26) {
    return `
      <svg
        viewBox="0 0 48 48"
        width="${size}"
        height="${size}"
        aria-hidden="true"
      >
        <path
          fill="#25F4EE"
          d="M30.2 7.5c1.2 5.5 4.5 8.8 9.8 10.2v6.3c-3.6-.1-6.9-1.2-9.8-3.2v12.1c0 7.8-6.3 14.1-14.1 14.1S2 40.7 2 32.9s6.3-14.1 14.1-14.1c.7 0 1.4.1 2.1.2v7.1c-.7-.2-1.4-.4-2.1-.4-4 0-7.2 3.2-7.2 7.2s3.2 7.2 7.2 7.2 7.2-3.2 7.2-7.2V7.5h6.9z"
        />
        <path
          fill="#FE2C55"
          d="M33.2 5c1.2 5.5 4.5 8.8 9.8 10.2v6.3c-3.6-.1-6.9-1.2-9.8-3.2v12.1c0 7.8-6.3 14.1-14.1 14.1-3.3 0-6.3-1.1-8.7-3 2.4 1.5 5.2 2.3 8.2 2.3 7.8 0 14.1-6.3 14.1-14.1V5h.4z"
        />
        <path
          fill="#ffffff"
          d="M30.2 7.5c.4 1.8 1 3.4 2 4.8v18.1c0 7.8-6.3 14.1-14.1 14.1-3 0-5.8-.9-8.1-2.5-2.9-2.6-4.8-6.4-4.8-10.7 0-7.8 6.3-14.1 14.1-14.1.7 0 1.4.1 2.1.2v7.1c-.7-.2-1.4-.4-2.1-.4-4 0-7.2 3.2-7.2 7.2s3.2 7.2 7.2 7.2 7.2-3.2 7.2-7.2V7.5h6.9z"
        />
      </svg>
    `;
  }

  async function loadConfig() {
    const response = await fetch(`${CONFIG_URL}?v=${Date.now()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Unable to load config.json");
    }

    return response.json();
  }

  function determineStatus(config) {
    if (config.testMode === true) {
      if (config.testState === "live") return "live";
      if (config.testState === "prelive") return "upcoming";
      if (config.testState === "hidden") return "hidden";

      return "upcoming";
    }

    if (
      !config.eventDate ||
      !config.showFromTime ||
      !config.startTime ||
      !config.endTime
    ) {
      return "hidden";
    }

    const now = getMalaysiaNow();

    const showFrom = createDateTime(
      config.eventDate,
      config.showFromTime
    );

    const liveStart = createDateTime(
      config.eventDate,
      config.startTime
    );

    const liveEnd = createDateTime(
      config.eventDate,
      config.endTime
    );

    if (now < showFrom || now > liveEnd) {
      return "hidden";
    }

    if (now >= liveStart && now <= liveEnd) {
      return "live";
    }

    return "upcoming";
  }

  function createWidget(config) {
    if (config.enabled !== true) return;

    const status = determineStatus(config);

    if (status === "hidden") return;

    const isLive = status === "live";

    const title = escapeHtml(
      config.title || "Balloon Decoration Tutorial"
    );

    const description = escapeHtml(
      config.description ||
        "Join Teamair on TikTok for useful balloon tips, tutorials and product demonstrations."
    );

    const displayDay = escapeHtml(config.displayDay || "");
    const displayTime = escapeHtml(config.displayTime || "");
    const language = escapeHtml(config.language || "");

    const preLiveLabel = escapeHtml(
      config.preLiveLabel || "LIVE TODAY"
    );

    const liveButtonText = escapeHtml(
      config.liveButtonText || "Join Live Now"
    );

    const preLiveButtonText = escapeHtml(
      config.preLiveButtonText || "View Teamair TikTok"
    );

    const buttonUrl = escapeHtml(
      config.buttonUrl || "https://www.tiktok.com/"
    );

    const poster = config.poster
      ? escapeHtml(config.poster)
      : "";

    const host = document.createElement("div");
    host.id = HOST_ID;

    const shadow = host.attachShadow({
      mode: "open"
    });

    const posterHtml = poster
      ? `
        <div class="poster-wrap">
          <img
            class="live-poster"
            src="${poster}"
            alt="${title}"
          >
        </div>
      `
      : `
        <div class="poster-placeholder">
          <div class="poster-logo">
            ${tiktokLogo(45)}
          </div>

          <div class="poster-placeholder-copy">
            <strong>TikTok LIVE</strong>
            <span>Teamair Balloon</span>
          </div>
        </div>
      `;

    shadow.innerHTML = `
      <style>
        :host {
          all: initial;
        }

        * {
          box-sizing: border-box;
        }

        button,
        a {
          font: inherit;
        }

        .widget-container {
          position: fixed;
          right: 20px;
          bottom: 105px;
          z-index: 2147483000;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        .live-pill {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 218px;
          padding: 10px 13px;
          overflow: hidden;
          color: #ffffff;
          background:
            linear-gradient(
              120deg,
              #25f4ee 0%,
              #2d9ec7 24%,
              #7a48b6 52%,
              #fe2c55 100%
            );
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          box-shadow:
            0 12px 30px rgba(33, 34, 44, 0.22),
            -7px 0 22px rgba(37, 244, 238, 0.28),
            7px 0 22px rgba(254, 44, 85, 0.28);
          cursor: pointer;
          animation: slideIn 0.45s ease-out;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
          user-select: none;
        }

        .live-pill::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              110deg,
              rgba(255, 255, 255, 0.36),
              transparent 34%,
              transparent 68%,
              rgba(255, 255, 255, 0.13)
            );
          pointer-events: none;
        }

        .live-pill:hover {
          transform: translateY(-2px);
          box-shadow:
            0 16px 36px rgba(33, 34, 44, 0.26),
            -8px 0 25px rgba(37, 244, 238, 0.34),
            8px 0 25px rgba(254, 44, 85, 0.34);
        }

        .live-pill:focus-visible {
          outline: 3px solid rgba(37, 244, 238, 0.55);
          outline-offset: 4px;
        }

        .pill-logo {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          background: rgba(20, 20, 26, 0.91);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 50%;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.18),
            inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        }

        .pill-copy {
          position: relative;
          z-index: 1;
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }

        .pill-title {
          overflow: hidden;
          color: #ffffff;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.1px;
          text-overflow: ellipsis;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.28);
          white-space: nowrap;
        }

        .pill-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ffffff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.65px;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
          text-transform: uppercase;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          flex-shrink: 0;
          background: ${isLive ? "#ffffff" : "#25f4ee"};
          border-radius: 50%;
          box-shadow:
            0 0 0 3px
            ${
              isLive
                ? "rgba(255,255,255,0.18)"
                : "rgba(37,244,238,0.18)"
            },
            0 0 12px
            ${
              isLive
                ? "rgba(255,255,255,0.95)"
                : "rgba(37,244,238,0.95)"
            };
        }

        .is-live .live-dot {
          animation: livePulse 1.05s infinite;
        }

        .pill-arrow {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          font-size: 18px;
          line-height: 1;
          transition: transform 0.22s ease;
        }

        .panel {
          position: absolute;
          right: 0;
          bottom: 66px;
          width: 330px;
          max-width: calc(100vw - 28px);
          overflow: hidden;
          color: #ffffff;
          background:
            radial-gradient(
              circle at top left,
              rgba(37, 244, 238, 0.85),
              transparent 42%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(254, 44, 85, 0.86),
              transparent 46%
            ),
            linear-gradient(
              145deg,
              #20cbd0 0%,
              #5946b5 50%,
              #f52b61 100%
            );
          border: 2px solid rgba(255, 255, 255, 0.88);
          border-radius: 22px;
          box-shadow:
            0 25px 70px rgba(21, 21, 31, 0.38),
            -12px 0 32px rgba(37, 244, 238, 0.2),
            12px 0 32px rgba(254, 44, 85, 0.22);
          opacity: 0;
          visibility: hidden;
          transform: translateY(14px) scale(0.96);
          transform-origin: bottom right;
          transition:
            opacity 0.22s ease,
            visibility 0.22s ease,
            transform 0.22s ease;
        }

        .panel.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0) scale(1);
        }

        .panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.22),
              transparent 38%,
              transparent 70%,
              rgba(255, 255, 255, 0.08)
            );
          pointer-events: none;
        }

        .panel-header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px 16px 12px;
        }

        .panel-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #ffffff;
          font-size: 15px;
          font-weight: 900;
          text-shadow: 0 1px 5px rgba(0, 0, 0, 0.24);
        }

        .panel-brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          background: rgba(18, 18, 24, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.68);
          border-radius: 50%;
        }

        .panel-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.32);
          border-radius: 50%;
          cursor: pointer;
          font-size: 21px;
          line-height: 1;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .panel-close:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(5deg);
        }

        .panel-close:focus-visible {
          outline: 3px solid rgba(255, 255, 255, 0.55);
          outline-offset: 3px;
        }

        .panel-body {
          position: relative;
          z-index: 1;
          margin: 0 10px 10px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 16px;
          box-shadow:
            0 12px 32px rgba(31, 28, 52, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
        }

        .poster-wrap {
          width: 100%;
          margin-bottom: 13px;
          overflow: hidden;
          background: #f3f4f6;
          border: 1px solid rgba(42, 42, 54, 0.08);
          border-radius: 13px;
        }

        .live-poster {
          display: block;
          width: 100%;
          max-height: 190px;
          object-fit: cover;
        }

        .poster-placeholder {
          display: flex;
          align-items: center;
          gap: 13px;
          min-height: 110px;
          margin-bottom: 13px;
          padding: 17px;
          overflow: hidden;
          color: #ffffff;
          background:
            radial-gradient(
              circle at top left,
              rgba(37, 244, 238, 0.8),
              transparent 45%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(254, 44, 85, 0.8),
              transparent 48%
            ),
            linear-gradient(
              135deg,
              #20202c,
              #633a96,
              #ec2e61
            );
          border-radius: 13px;
        }

        .poster-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 62px;
          height: 62px;
          flex-shrink: 0;
          background: rgba(16, 16, 22, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 18px;
        }

        .poster-placeholder-copy {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .poster-placeholder-copy strong {
          font-size: 18px;
          font-weight: 900;
        }

        .poster-placeholder-copy span {
          color: rgba(255, 255, 255, 0.82);
          font-size: 12px;
          font-weight: 700;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          padding: 7px 10px;
          color: #ffffff;
          background:
            ${
              isLive
                ? "linear-gradient(90deg, #fe2c55, #df2775)"
                : "linear-gradient(90deg, #18bfc0, #4b78c9)"
            };
          border-radius: 999px;
          box-shadow:
            0 6px 14px
            ${
              isLive
                ? "rgba(254,44,85,0.22)"
                : "rgba(37,180,210,0.22)"
            };
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .status-badge .live-dot {
          width: 7px;
          height: 7px;
          background: #ffffff;
          box-shadow:
            0 0 0 3px rgba(255, 255, 255, 0.18),
            0 0 9px rgba(255, 255, 255, 0.85);
        }

        .panel-title {
          margin: 0;
          color: #242333;
          font-size: 20px;
          line-height: 1.28;
          font-weight: 900;
        }

        .panel-description {
          margin: 8px 0 0;
          color: #5f6170;
          font-size: 13px;
          line-height: 1.55;
        }

        .panel-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 12px;
        }

        .meta-chip {
          padding: 6px 9px;
          color: #474657;
          background: #f1f1f5;
          border: 1px solid #e4e4ea;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
        }

        .join-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 14px;
          padding: 12px 14px;
          color: #ffffff;
          background:
            linear-gradient(
              90deg,
              #25cfd0 0%,
              #7250b7 48%,
              #fe2c55 100%
            );
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          box-shadow:
            0 10px 24px rgba(112, 64, 157, 0.25),
            -4px 0 14px rgba(37, 244, 238, 0.16),
            4px 0 14px rgba(254, 44, 85, 0.18);
          text-decoration: none;
          font-size: 13px;
          font-weight: 900;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .join-button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 14px 28px rgba(112, 64, 157, 0.31),
            -5px 0 16px rgba(37, 244, 238, 0.2),
            5px 0 16px rgba(254, 44, 85, 0.22);
        }

        .join-button:focus-visible {
          outline: 3px solid rgba(37, 244, 238, 0.45);
          outline-offset: 4px;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(35px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes livePulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: 0.35;
            transform: scale(1.65);
          }
        }

        @media (max-width: 600px) {
          .widget-container {
            right: 13px;
            bottom: 88px;
          }

          .live-pill {
            min-width: 188px;
            padding: 8px 10px;
          }

          .pill-logo {
            width: 35px;
            height: 35px;
          }

          .pill-title {
            font-size: 12px;
          }

          .pill-status {
            font-size: 9px;
          }

          .panel {
            width: min(315px, calc(100vw - 26px));
            bottom: 61px;
          }

          .panel-title {
            font-size: 18px;
          }

          .panel-description {
            font-size: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .live-pill,
          .panel,
          .pill-arrow,
          .live-dot {
            animation: none !important;
            transition: none !important;
          }
        }
      </style>

      <div class="widget-container">
        <div
          class="live-pill ${isLive ? "is-live" : ""}"
          role="button"
          tabindex="0"
          aria-label="Open TikTok Live notification"
          aria-expanded="false"
        >
          <div class="pill-logo">
            ${tiktokLogo(24)}
          </div>

          <div class="pill-copy">
            <div class="pill-title">
              TikTok LIVE
            </div>

            <div class="pill-status">
              <span class="live-dot"></span>

              <span>
                ${isLive ? "LIVE NOW" : preLiveLabel}
              </span>
            </div>
          </div>

          <div class="pill-arrow">›</div>
        </div>

        <section
          class="panel"
          aria-hidden="true"
        >
          <div class="panel-header">
            <div class="panel-brand">
              <div class="panel-brand-logo">
                ${tiktokLogo(22)}
              </div>

              <span>TikTok LIVE</span>
            </div>

            <button
              class="panel-close"
              type="button"
              aria-label="Close TikTok Live panel"
            >
              ×
            </button>
          </div>

          <div class="panel-body">
            ${posterHtml}

            <div class="status-badge">
              <span class="live-dot"></span>

              <span>
                ${isLive ? "LIVE NOW" : preLiveLabel}
              </span>
            </div>

            <h3 class="panel-title">
              ${title}
            </h3>

            ${
              description
                ? `
                  <p class="panel-description">
                    ${description}
                  </p>
                `
                : ""
            }

            <div class="panel-meta">
              ${
                displayDay
                  ? `<span class="meta-chip">${displayDay}</span>`
                  : ""
              }

              ${
                displayTime
                  ? `<span class="meta-chip">${displayTime}</span>`
                  : ""
              }

              ${
                language
                  ? `<span class="meta-chip">${language}</span>`
                  : ""
              }
            </div>

            <a
              class="join-button"
              href="${buttonUrl}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${tiktokLogo(20)}

              <span>
                ${
                  isLive
                    ? liveButtonText
                    : preLiveButtonText
                }
              </span>
            </a>
          </div>
        </section>
      </div>
    `;

    document.body.appendChild(host);

    const pill = shadow.querySelector(".live-pill");
    const panel = shadow.querySelector(".panel");
    const closeButton = shadow.querySelector(".panel-close");
    const arrow = shadow.querySelector(".pill-arrow");

    function openPanel() {
      panel.classList.add("open");
      panel.setAttribute("aria-hidden", "false");
      pill.setAttribute("aria-expanded", "true");
      arrow.style.transform = "rotate(90deg)";
    }

    function closePanel() {
      panel.classList.remove("open");
      panel.setAttribute("aria-hidden", "true");
      pill.setAttribute("aria-expanded", "false");
      arrow.style.transform = "rotate(0deg)";
    }

    function togglePanel() {
      if (panel.classList.contains("open")) {
        closePanel();
      } else {
        openPanel();
      }
    }

    pill.addEventListener("click", togglePanel);

    pill.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePanel();
      }

      if (event.key === "Escape") {
        closePanel();
      }
    });

    closeButton.addEventListener("click", function (event) {
      event.stopPropagation();
      closePanel();
      pill.focus();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closePanel();
      }
    });
  }

  loadConfig()
    .then(createWidget)
    .catch(function (error) {
      console.error(
        "Teamair TikTok Live Widget:",
        error.message
      );
    });
})();