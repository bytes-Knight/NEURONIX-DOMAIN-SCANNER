# ⚡ NEURONIX-DOMAIN-SCANNER  

**NEURONIX-DOMAIN-SCANNER** is a browser extension built for **bug bounty hunters** and **security researchers** who love speed, automation, and clean results.  
It’s your go-to tool for extracting **domains** and **wildcards** directly from **Bugcrowd** and **HackerOne** program scopes — all in a few savage clicks.

Whether you’re mapping targets, preparing scope lists, or organizing recon data — **NEURONIX-DOMAIN-SCANNER** makes domain collection fast, smart, and deadly efficient. ⚔️

---
## 🚀 Features

### 🧠 Advanced Extraction Modes
*Fully compatible with Bugcrowd and HackerOne scope pages.*

- **All Domains**: Extracts every potential domain from the page, including wildcards and exact domains.
- **Wildcards Only**: Isolates and lists only wildcard domains (e.g., `*.example.com`).
- **Exact Domains**: Extracts only specific, non-wildcard domains (e.g., `www.example.com`).
- **Clean Wildcards**: Extracts wildcard domains and removes the `*.` prefix, leaving a clean list of root domains.

### ✨ Smart Filtering & Validation
- **Enhanced Accuracy**: Intelligently filters out common false positives like CDN placeholders, irrelevant text, and code snippets.
- **Domain Validation**: Ensures that extracted strings are valid, well-formed domains before they are added to the list.

### 💼 Streamlined Workflow
- **Instant Preview**: See the extracted domains in the extension popup before downloading.
- **Live Counts**: Get immediate counts for each category (All, Wildcards, Exact, Cleaned).
- **One-Click Export**: Download your domain list as a clean `.txt` file, automatically named with the platform and timestamp.
- **Audio Feedback**: Unique sound cues confirm your actions for a seamless experience.
- **Platform Integration**: Works flawlessly on both Bugcrowd and HackerOne program pages.

---

## 📖 How to Use

1. **Navigate to a Target**: Go to any Bugcrowd or HackerOne program's scope page.
2. **Open the Extension**: Click the **NEURONIX-DOMAIN-SCANNER** icon in your browser's toolbar.
3. **Choose an Extraction Mode**:
   - Click **`Extract All Domains`** for a complete list of all domains.
   - Click **`Extract Wildcards`** to get only wildcard domains.
   - Click **`Extract Exact Domains`** for non-wildcard domains.
   - Click **`Clean Wildcards`** to get wildcards with the `*.` prefix removed.
4. **Preview the Results**: The domains will appear instantly in the preview text area. Check the live counts to see a breakdown.
5. **Download**: Click the **`Download (.txt)`** button to save the list to a file. The file will be automatically named for you.

---

## 🖼️ Screenshots

### Scope Extraction in Action  
*Extract and preview domains directly from scope pages in seconds.*

<img width="489" height="659" alt="image" src="https://github.com/user-attachments/assets/55896045-cd4b-4c23-8cba-8f17f51a1837" />


---

## 🧾 Changelog

### v2.1 (Latest)
- **Feature**: Added **Exact Domains** extraction mode.
- **Feature**: Implemented live counts for all categories.
- **Feature**: Added audio feedback for user actions.
- **Improvement**: Significantly enhanced domain validation and filtering logic to reduce false positives.
- **Improvement**: Updated UI with clearer buttons and status messages.
- **Refactor**: Modernized the codebase for better performance and reliability.

### v1.0  
- Initial release
- Domain and wildcard extraction
- `.txt` download support
- Full support for **Bugcrowd** and **HackerOne**

---

## ⚙️ Installation Guide

1. **Download the Extension**:
   - Click the green **Code** button on this repository page.
   - Select **Download ZIP** and save the file.
   - Unzip the downloaded file.

2. **Load the Extension in Your Browser**:
   - Open Chrome and navigate to `chrome://extensions`.
   - Enable **Developer mode** using the toggle in the top-right corner.
   - Click **Load unpacked**.
   - Select the unzipped `NEURONIX-DOMAIN-SCANNER` folder.

3. **Pin the Extension**:
   - Click the puzzle piece icon (Extensions) in your toolbar.
   - Find **NEURONIX-DOMAIN-SCANNER** and click the pin icon next to it.
   - Now you're ready to go! ⚡

---

## 👑 Contributors

- **Bytes_Knight** — Creator & Maintainer  
  🏴‍☠️ Bugcrowd: [@Bytes_Knight](https://bugcrowd.com/Bytes_Knight)

---

## 💡 Contributing

Contributions are welcome! If you have ideas for improvements, new features, or bug fixes, please follow these steps:

1. **Fork the repository.**
2. **Create a new branch** (`git checkout -b feature/your-feature-name`).
3. **Make your changes.**
4. **Commit your changes** (`git commit -m 'Add some feature'`).
5. **Push to the branch** (`git push origin feature/your-feature-name`).
6. **Open a pull request.**

Alternatively, you can open an issue to discuss your ideas or report a bug.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🧩 Potential TODOs

- [ ] Add more deep-scope extraction logic  
- [ ] Implement dark mode UI  
- [ ] Add auto-copy / download in `.txt` format  
- [ ] Expand platform support beyond Bugcrowd & HackerOne  

---

## 🔒 Privacy Note

- **NEURONIX-DOMAIN-SCANNER** only processes publicly visible scope data from bug bounty platforms.  
- No private data is collected, stored, or transmitted — ever.  
- 100% open source for transparency and auditing.  
- It doesn’t exclude out-of-scope assets automatically — double-check before hunting. 🕶️  

---

> ⚡ *NEURONIX-DOMAIN-SCANNER — built by a hunter, for hunters.*  
> Because manual scope scraping is for rookies.
