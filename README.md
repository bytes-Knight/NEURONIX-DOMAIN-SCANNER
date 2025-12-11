# 🚀 NEURONIX-DOMAIN-SCANNER

Neuronix is a browser extension for bug bounty hunters to pull domains and wildcards straight from Bugcrowd and HackerOne scopes. Faster extraction, stricter validation, and clean exports in a couple clicks.

---
## ✨ Features

### Extraction Modes (Bugcrowd & HackerOne)
- **Wildcard Scan** – only `*.example.com`.
- **Exact Probe** – non-wildcard domains.
- **Full Sweep** – everything valid we detect.
- **Clean Purge** – wildcards with `*.` stripped.

### 🧠 Smarter Detection
- Boundary-aware parsing to stop glued suffixes (no `.comquantum` junk).
- Ignores the extension’s own UI so highlights/tooltips never pollute results.
- Scans links, attributes, and text nodes with TLD length and part checks.

### 🎨 New UI (v2.2)
- Space Grotesk glass look with dual-row pill controls and chip counters.
- Live buffer panel with higher contrast and updated download/action styles.
- Count badges on buttons plus chip summaries for all modes.

### ⚡ Workflow
- Instant preview before export.
- One-click download to timestamped `.txt`.
- Audio cues for actions.

---
## 🛠️ How to Use

1. Open a Bugcrowd or HackerOne scope page.
2. Click the extension icon.
3. Pick a mode: `Wildcard Scan`, `Exact Probe`, `Full Sweep`, or `Clean Purge`.
4. Review the live buffer, then click **“Quantum Download”** to export.

---
## 🧾 Changelog

### v2.2
- New popup UI (glass cards, chips, pill buttons, Space Grotesk).
- Boundary-aware extraction fixes; ignores injected UI to keep results clean.
- Better validation to avoid suffix bleed and duplicates.

### v2.1
- Added Exact Domains mode, live counts, and audio feedback.

---
## 📦 Installation

1. Download the repo ZIP and unzip.
2. Chrome: `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select the folder.
3. Pin the extension from the toolbar puzzle icon.

---
## 🤝 Contributors

- **Bytes_Knight** — Creator & Maintainer  
  Bugcrowd: [@Bytes_Knight](https://bugcrowd.com/Bytes_Knight)

---
## 🧭 Contributing

1. Fork the repo.
2. Create a branch: `git checkout -b feature/your-feature-name`.
3. Make changes and commit: `git commit -m "Add feature"`.
4. Push: `git push origin feature/your-feature-name`.
5. Open a PR.

---
## 📜 License

MIT. See [LICENSE](LICENSE).

---

> 🎯 NEURONIX-DOMAIN-SCANNER — built by a hunter, for hunters.
