// Content script for Neuronix Domain Scanner - Futuristic Holographic Interactions

(function() {
    'use strict';
    
    // Only run on relevant pages
    const isBugcrowd = window.location.hostname.includes('bugcrowd.com');
    const isHackerOne = window.location.hostname.includes('hackerone.com');
    
    if (!isBugcrowd && !isHackerOne) {
        return;
    }
    
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
    
    // Create holographic floating orb
    function createHolographicOrb() {
        const orb = document.createElement('div');
        orb.id = 'domain-extractor-fab';
        orb.innerHTML = '⚡';
        orb.title = 'Neuronix Scanner - Activate Quantum Extraction';
        
        orb.style.cssText = `
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(0,255,255,0.3), rgba(255,0,255,0.3));
            color: #000;
            border: 2px solid transparent;
            background-clip: padding-box;
            border-image: linear-gradient(45deg, var(--neon-cyan), var(--neon-magenta)) 1;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-family: 'Orbitron', monospace;
            z-index: 10000;
            transition: all 0.4s ease;
            user-select: none;
            backdrop-filter: blur(20px);
            box-shadow: var(--glow-cyan), var(--glow-magenta), 0 0 50px rgba(0,0,0,0.5);
        `;
        
        // Holographic hover and click effects
        orb.addEventListener('mouseenter', () => {
            orb.style.transform = 'rotateY(180deg) scale(1.15)';
            orb.style.boxShadow = '0 0 40px var(--neon-cyan), 0 0 60px var(--neon-magenta)';
            orb.style.animation = 'holographicPulse 1s ease-in-out infinite';
        });
        
        orb.addEventListener('mouseleave', () => {
            orb.style.transform = 'rotateY(0deg) scale(1)';
            orb.style.boxShadow = 'var(--glow-cyan), var(--glow-magenta)';
            orb.style.animation = 'none';
        });
        
        // Click: Trigger popup with futuristic feedback
        orb.addEventListener('click', (e) => {
            e.preventDefault();
            orb.style.transform = 'scale(0.8) rotate(720deg)';
            orb.style.opacity = '0.7';
            setTimeout(() => {
                orb.style.transform = 'rotateY(0deg) scale(1)';
                orb.style.opacity = '1';
                chrome.runtime.sendMessage({ action: 'openPopup' });
            }, 300);
        });
        
        document.body.appendChild(orb);
    }
    
    // Enhanced domain detection with holographic highlights and improved validation
    function detectAndHighlightDomains() {
        const domains = new Set();
        const wildcards = new Set();
        const exacts = new Set();
        
        // Enhanced selectors (unchanged)
        let selectors = [];
        if (isBugcrowd) {
            selectors = [
                '[data-testid="target-groups"] [data-testid="in-scope-table"] td:first-child',
                '.target-group .scope-table td:first-child',
                '.bc-panel .bc-table .bc-table__row td:first-child',
                '.target-table tbody tr td:first-child',
                '.in-scope-table tbody tr td:first-child',
                'table.in-scope td:first-child',
                '.scope-item .domain'
            ];
        } else if (isHackerOne) {
            selectors = [
                '[data-testid="policy-scopes"] tbody tr td:first-child',
                '.policy-scopes tbody tr td:first-child',
                '.structured-scope-list tbody tr td:first-child',
                '.scope-list tbody tr td:first-child',
                '.spec-scope-table tbody tr td:first-child',
                '.asset-identifier',
                '[data-scope-type="domain"]'
            ];
        }
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(cell => {
                const text = cell.textContent.trim();
                if (text && (text.includes('.') || text.startsWith('*.'))) {
                    const lowerText = text.toLowerCase();
                    if (isValidDomain(lowerText)) {
                        domains.add(lowerText);
                        if (lowerText.startsWith('*.') ) wildcards.add(lowerText);
                        else exacts.add(lowerText);
                        holographicHighlight(cell, lowerText);
                    }
                }
            });
        });
        
        // Update orb with holographic count
        const total = domains.size;
        if (total > 0) {
            const fab = document.getElementById('domain-extractor-fab');
            if (fab) {
                fab.innerHTML = `⚡ ${total}`;
                fab.title = `Neural lock: ${total} assets (${wildcards.size} wild, ${exacts.size} exact) - Engage extraction`;
                fab.style.animation = 'holographicPulse 2s ease-in-out infinite';
                showHologramStatus(`Holo-scan: ${total} assets materialized`, 'success');
            }
        }
        
        return { total, wildcards: wildcards.size, exact: exacts.size };
    }
    
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
            tooltip.innerHTML = `<strong style="color: var(--neon-magenta);">${domain}</strong><br><small style="color: var(--neon-cyan);">Quantum asset locked</small>`;
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
        domain = domain.toLowerCase();
        if (!domain || domain.length < 4 || domain.length > 253) return false;
        if (!domain.includes('.')) return false;
        
        const domainRegex = /^(\*\.)?([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(\.[a-z]{2,})?$/;
        if (!domainRegex.test(domain)) return false;
        
        // Exclude CDN placeholders like hscoscdn
        if (/hscoscdn[a-z]{2}\.net/.test(domain) || /group[a-z]{2}\./.test(domain)) {
            return false;
        }
        
        const excludePatterns = [
            /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|zip|exe|dll|json|mov|mp4|avi|mkv|xml|csv|htm|html|css|js|php|asp|aspx|jsp|cgi|pl|py|rb|sh)$/i,
            /^(http|https|ftp|smtp|pop3|imap|www|file)$/i,
            /(dashboard|assistance|date|issues|services|verifyiframediscovery|morea|eligible|ineligible|sketch|targets|bugcrowd|hackerone|web|mobile|ios|android|other)$/i,
            /\d{4,}\.json$/i,
            /hscoscdn/i
        ];
        
        for (const pattern of excludePatterns) {
            if (pattern.test(domain)) return false;
        }
        
        const parts = domain.replace(/^\*\./, '').split('.');
        if (parts.length < 2) return false;
        
        // Parts validation: no empty, no leading/trailing -, allow numerics
        for (const part of parts) {
            if (!part || part.length === 0 || part.startsWith('-') || part.endsWith('-') || !/^[a-z0-9]/.test(part)) return false;
        }
        
        // Additional: flag parts with repeated letters at end like 'xx', 'yy' (common placeholders)
        for (const part of parts) {
            if (/([a-z])\1{1,}$/.test(part) && part.length > 2) {
                return false;
            }
        }
        
        // TLD: letters only, 2+
        const tld = parts[parts.length - 1];
        if (tld.length < 2 || !/^[a-z]+$/.test(tld)) return false;
        
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
        status.innerHTML = `<span style="color: var(--neon-magenta);">●</span> ${message}`;
        status.classList.add('show');
        setTimeout(() => status.classList.remove('show'), 4000);
    }
    
    // Initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            createHolographicOrb();
            setTimeout(detectAndHighlightDomains, 2500);
        });
    } else {
        createHolographicOrb();
        setTimeout(detectAndHighlightDomains, 2500);
    }
    
    // Monitor mutations for dynamic holograms
    const observer = new MutationObserver(() => {
        setTimeout(detectAndHighlightDomains, 2000);
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
    });
    
})();