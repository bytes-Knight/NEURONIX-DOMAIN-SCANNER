// Content script for Neuronix Domain Scanner - Futuristic Holographic Interactions

(function () {
    'use strict';

    // Only run on relevant pages
    const isBugcrowd = window.location.hostname.includes('bugcrowd.com');
    const isHackerOne = window.location.hostname.includes('hackerone.com');

    if (!isBugcrowd && !isHackerOne) {
        return;
    }

    let cachedDomains = {
        all: new Set(),
        wildcards: new Set(),
        exact: new Set()
    };
    const quickDomainTest = /(\*\.)?[a-z0-9][a-z0-9-]*\.[a-z0-9-]*[a-z]{2,}(?![a-z0-9-])/i;
    const domainCandidateRegex = /(?:(?:https?:\/\/|wss?:\/\/)?(?:\*\.?)?(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[a-z]{2,})(?:\.[a-z]{2,})?(?::\d{2,5})?(?:[\/#?][^\s\]\)\}>]*)?)(?![a-z0-9-])/gi;

    // Inject futuristic styles
    const styleId = 'neuronix-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
            
            @keyframes holographicPulse {
                0% { 
                    box-shadow: 0 0 10px var(--neon-cyan), inset 0 0 10px rgba(0,255,255,0.2);
                    transform: rotateZ(0deg) scale(1);
                }
                50% { 
                    box-shadow: 0 0 30px var(--neon-magenta), inset 0 0 20px rgba(255,0,255,0.3);
                    transform: rotateZ(180deg) scale(1.1);
                }
                100% { 
                    box-shadow: 0 0 10px var(--neon-cyan), inset 0 0 10px rgba(0,255,255,0.2);
                    transform: rotateZ(360deg) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }

    const isNeuronixUi = (el) => {
        if (!el) return false;
        return Boolean(el.closest('[data-neuronix-ui="true"], .domain-extractor-tooltip, .domain-extractor-status'));
    };

    // Collect text from an element while skipping our own injected UI nodes
    function getCleanTextFromElement(element) {
        if (!element || isNeuronixUi(element)) return '';

        let text = '';
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    if (!node.parentElement) return NodeFilter.FILTER_REJECT;
                    if (isNeuronixUi(node.parentElement)) return NodeFilter.FILTER_REJECT;
                    if (node.parentElement.offsetParent === null) return NodeFilter.FILTER_REJECT;
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );
        let node;
        while ((node = walker.nextNode())) {
            text += ' ' + node.textContent;
        }
        return text.trim();
    }

    // Extract domains and wildcards from arbitrary text (URLs, attributes, plain text)
    function extractDomainsFromText(text) {
        const results = new Set();
        let match;
        domainCandidateRegex.lastIndex = 0; // reset between runs

        while ((match = domainCandidateRegex.exec(text)) !== null) {
            let candidate = match[0]
                .replace(/^(?:https?:\/\/|wss?:\/\/)/i, '') // remove protocol
                .replace(/:\d{2,5}(?=$|[\/#?])/, '') // remove port if present
                .split(/[\/#?]/)[0] // drop path/query/hash
                .replace(/^[\(\[\{<'"`]+|[\)\]\}>'"`.,;:!?]+$/g, '') // trim punctuation
                .toLowerCase();

            candidate = candidate.replace(/^\*+\.?/, '*.'); // normalize wildcard prefix
            candidate = candidate.replace(/\.+$/, ''); // trim trailing dots

            // Trim any trailing words accidentally glued to the TLD (e.g., ".comquantum")
            const domainOnlyMatch = candidate.match(/^(\*\.)?([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+([a-z]{2,24})(\.[a-z]{2,24})?/);
            if (domainOnlyMatch) {
                candidate = domainOnlyMatch[0];
            }

            // Enforce end boundary to avoid glued text (e.g., comexample)
            if (/[a-z0-9-]$/i.test(candidate)) {
                const endChar = text[domainCandidateRegex.lastIndex] || ' ';
                if (/[a-z0-9-]/i.test(endChar)) continue;
            }

            if (isValidDomain(candidate)) {
                results.add(candidate);
            }
        }

        return results;
    }

    // Helper to process a single element or text string
    function processElement(element, domains, wildcards, exacts, seen, textContentOverride = null) {
        if (isNeuronixUi(element)) return;

        const text = (textContentOverride || getCleanTextFromElement(element) || '').trim();
        if (!text || !quickDomainTest.test(text)) return;

        const found = extractDomainsFromText(text);

        found.forEach(domain => {
            if (seen.has(domain)) return;
            seen.add(domain);

            domains.add(domain);
            if (domain.startsWith('*.')) {
                wildcards.add(domain);
            } else {
                exacts.add(domain);
            }

            // Only highlight if it's a specific element we targeted, not the whole body
            // AND it is a wildcard or subdomain (simple heuristic: > 2 parts or starts with *.)
            if (element !== document.body) {
                const parts = domain.replace(/^\*\./, '').split('.');
                if (domain.startsWith('*.') || parts.length > 2) {
                    holographicHighlight(element, domain);
                }
            }
        });
    }

    // Enhanced domain detection with holographic highlights and improved validation
    function detectAndHighlightDomains() {
        const domains = new Set();
        const wildcards = new Set();
        const exacts = new Set();
        const seen = new Set(); // Track seen domains to avoid duplicates

        // Enhanced selectors based on typical Bugcrowd/HackerOne layouts
        let selectors = [];
        if (isBugcrowd) {
            selectors = [
                // Specific tables
                '[data-testid="target-groups"] [data-testid="in-scope-table"] td:first-child',
                '.target-group .scope-table td:first-child',
                '.bc-panel .bc-table .bc-table__row td:first-child',
                // Generic tables
                'table[class*="scope"] td:first-child',
                'table[class*="target"] td:first-child',
                // List items or divs that might contain domains
                '.cc-asset-table__asset-name',
                '[class*="asset"] strong',
                '[class*="target"] strong',
                // Fallback for new UI
                'div[class*="target"]',
                'span[class*="target"]'
            ];
        } else if (isHackerOne) {
            selectors = [
                '[data-testid="policy-scopes"] tbody tr td:first-child',
                '.policy-scopes tbody tr td:first-child',
                '.structured-scope-list tbody tr td:first-child',
                '.scope-list tbody tr td:first-child',
                '.spec-scope-table tbody tr td:first-child',
                '.asset-identifier',
                '[data-scope-type="domain"]',
                // Fallback generic
                'table td.asset'
            ];
        }

        // Primary scan using selectors
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                processElement(el, domains, wildcards, exacts, seen);
            });
        });

        // Scan links and common asset attributes
        document.querySelectorAll('a[href], area[href]').forEach(el => {
            if (isNeuronixUi(el)) return;
            processElement(el, domains, wildcards, exacts, seen, el.getAttribute('href'));
        });

        document.querySelectorAll('[data-asset-identifier],[data-testid*="asset"],[data-qa*="asset"],[aria-label],[title]').forEach(el => {
            if (isNeuronixUi(el)) return;
            const attributeText = el.getAttribute('data-asset-identifier')
                || el.getAttribute('data-testid')
                || el.getAttribute('data-qa')
                || el.getAttribute('aria-label')
                || el.getAttribute('title')
                || '';
            if (attributeText) {
                processElement(el, domains, wildcards, exacts, seen, attributeText);
            }
        });

        // Broader scan of text nodes with sensible caps for performance
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    if (!node.parentElement) return NodeFilter.FILTER_REJECT;
                    if (isNeuronixUi(node.parentElement)) return NodeFilter.FILTER_REJECT;
                    // Skip hidden or irrelevant nodes
                    if (node.parentElement.offsetParent === null) return NodeFilter.FILTER_REJECT;
                    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA'].includes(node.parentElement.tagName)) return NodeFilter.FILTER_REJECT;
                    // Quick regex to see if text looks like a domain candidate
                    if (quickDomainTest.test(node.textContent)) return NodeFilter.FILTER_ACCEPT;
                    return NodeFilter.FILTER_SKIP;
                }
            }
        );

        let node;
        let scannedNodes = 0;
        const maxNodes = 800; // prevent runaway scans on very large pages
        while ((node = walker.nextNode()) && scannedNodes < maxNodes) {
            scannedNodes++;
            // Pass the parent element for highlighting purposes
            processElement(node.parentElement, domains, wildcards, exacts, seen, node.textContent);
        }

        // Cache them
        cachedDomains.all = domains;
        cachedDomains.wildcards = wildcards;
        cachedDomains.exact = exacts;

        return { total: domains.size, wildcards: wildcards.size, exact: exacts.size };
    }

    // Message listener for popup interactions
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'getDomains') {
            // Re-scan to be sure
            detectAndHighlightDomains();

            // Filter based on request type
            let resultDomains = [];
            let resultCount = 0;
            const mode = request.mode || 'all';

            if (mode === 'wildcards') {
                resultDomains = Array.from(cachedDomains.wildcards);
            } else if (mode === 'exact') {
                resultDomains = Array.from(cachedDomains.exact);
            } else if (mode === 'clean') {
                resultDomains = Array.from(cachedDomains.wildcards).map(d => d.replace(/^\*\./, ''));
            } else {
                resultDomains = Array.from(cachedDomains.all);
            }

            resultDomains.sort();

            sendResponse({
                domains: resultDomains,
                counts: {
                    all: cachedDomains.all.size,
                    wildcards: cachedDomains.wildcards.size,
                    exact: cachedDomains.exact.size,
                    clean: cachedDomains.wildcards.size // 'Clean' count matches wildcards count usually
                }
            });
        }
        return true; // Keep channel open
    });

    // Holographic highlight with 3D effects
    function holographicHighlight(element, domain) {
        if (element.classList.contains('domain-extractor-highlight')) return;

        element.classList.add('domain-extractor-highlight', 'domain-found');
        element.style.transformStyle = 'preserve-3d';

        // Add holographic tooltip
        let tooltip = element.querySelector('.domain-extractor-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'domain-extractor-tooltip';
            tooltip.setAttribute('data-neuronix-ui', 'true');
            tooltip.setAttribute('aria-hidden', 'true');

            // Safer DOM construction
            const strong = document.createElement('strong');
            strong.textContent = domain;
            strong.style.color = 'var(--neon-magenta)';

            const br = document.createElement('br');

            const small = document.createElement('small');
            small.textContent = 'Quantum asset locked';
            small.style.color = 'var(--neon-cyan)';

            tooltip.appendChild(strong);
            tooltip.appendChild(br);
            tooltip.appendChild(small);

            element.appendChild(tooltip);
        }

        // Hologram interactions
        const showTooltip = () => tooltip.classList.add('show');
        const hideTooltip = () => tooltip.classList.remove('show');

        element.addEventListener('mouseenter', () => {
            showTooltip();
            element.style.transform = 'rotateX(5deg) rotateY(5deg) scale(1.02)';
        });
        element.addEventListener('mouseleave', () => {
            hideTooltip();
            element.style.transform = 'rotateX(0deg) rotateY(0deg) scale(1)';
        });
    }

    // Validation function (shared and enhanced)
    function isValidDomain(domain) {
        if (typeof domain !== 'string') return false;
        domain = domain.toLowerCase().trim().replace(/\.+$/, '');

        if (!domain || domain.length < 4 || domain.length > 253) return false;
        if (!domain.includes('.')) return false;

        const domainRegex = /^(\*\.)?([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+([a-z]{2,})(\.[a-z]{2,})*$/;
        if (!domainRegex.test(domain)) return false;

        // Exclude CDN placeholders like hscoscdn
        if (/hscoscdn[a-z]{2}\.net/.test(domain) || /group[a-z]{2}\./.test(domain)) {
            return false;
        }

        const baseDomain = domain.replace(/^\*\./, '');
        const placeholders = ['dashboard', 'assistance', 'date', 'issues', 'services', 'verifyiframediscovery', 'morea', 'eligible', 'ineligible', 'sketch', 'targets', 'bugcrowd', 'hackerone', 'web', 'mobile', 'ios', 'android', 'other', 'localhost', 'example', 'test', 'invalid'];
        if (placeholders.includes(baseDomain)) return false;

        const excludePatterns = [
            /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|zip|exe|dll|json|mov|mp4|avi|mkv|xml|csv|htm|html|css|js|php|asp|aspx|jsp|cgi|rb)$/i,
            /^(http|https|ftp|smtp|pop3|imap|www|file)$/i,
            /\d{4,}\.json$/i,
            /hscoscdn/i
        ];

        for (const pattern of excludePatterns) {
            if (pattern.test(domain)) return false;
        }

        const parts = baseDomain.split('.');
        if (parts.length < 2) return false;

        // Parts validation: no empty, no leading/trailing -, allow numerics
        for (const part of parts) {
            if (!part || part.length === 0 || part.startsWith('-') || part.endsWith('-') || !/^[a-z0-9]/.test(part)) return false;
        }

        // Additional: flag parts with repeated letters at end like 'xx', 'yy' (common placeholders)
        for (const part of parts) {
            if (/([a-z])\1{2,}$/.test(part) && part.length > 3) {
                // Tuned to 3 repeats to be safer
                return false;
            }
        }

        // TLD: letters only, 2+
        const tld = parts[parts.length - 1];
        if (tld.length < 2 || tld.length > 24 || !/^[a-z]+$/.test(tld)) return false;

        return true;
    }

    // Hologram status projection
    function showHologramStatus(message, type = 'success') {
        let status = document.querySelector('.domain-extractor-status');
        if (!status) {
            status = document.createElement('div');
            status.className = `domain-extractor-status ${type}`;
            document.body.appendChild(status);
        }

        // Safer DOM construction
        status.innerHTML = ''; // Clear prev
        const indicator = document.createElement('span');
        indicator.textContent = '● ';
        indicator.style.color = 'var(--neon-magenta)';

        const msgNode = document.createTextNode(message);

        status.appendChild(indicator);
        status.appendChild(msgNode);

        status.classList.add('show');
        setTimeout(() => status.classList.remove('show'), 4000);
    }

    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(detectAndHighlightDomains, 1000); // Faster init
        });
    } else {
        setTimeout(detectAndHighlightDomains, 1000);
    }

    // Monitor mutations for dynamic holograms - debounced
    let mutationTimeout;
    const observer = new MutationObserver(() => {
        clearTimeout(mutationTimeout);
        mutationTimeout = setTimeout(detectAndHighlightDomains, 1500);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });

})();
