export default class LocalLeaderboard {
    constructor(gameName = 'Global', options = {}) {
        this.gameName = gameName;
        this.storageKey = `score_counter_${gameName}`;
        this.maxEntries = options.maxEntries || 50;
        this.topN = options.topN || 5;
        this.title = options.title || 'Leaderboard';
        this.scoreLabel = options.scoreLabel || 'Coins';
        this.isOpen = false;
        this.mounted = false;

        this._init();
    }

    _init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this._mount());
        } else {
            this._mount();
        }
    }

    _mount() {
        if (this.mounted) return;

        const container = document.createElement('div');
        container.id = 'local-leaderboard-container';
        container.style.cssText = `
            position:fixed;top:80px;left:20px;z-index:1000;
            min-width:240px;max-width:340px;
            background:linear-gradient(135deg,#2a1810 0%,#1a0a05 100%);
            border:2px solid #f0c030;
            border-radius:10px;
            box-shadow:0 6px 24px rgba(0,0,0,0.6),0 0 20px rgba(240,192,48,0.15);
            font-family:'Courier New',monospace;
            color:#e8e0d8;
        `;

        container.innerHTML = `
            <div id="local-lb-header" style="padding:10px 14px;display:flex;justify-content:space-between;align-items:center;gap:10px;cursor:pointer;user-select:none;">
                <div style="display:flex;flex-direction:column;gap:2px;">
                    <span style="font-size:16px;font-weight:800;color:#f0c030;letter-spacing:1px;">${this._escape(this.title)}</span>
                    <span id="local-lb-preview" style="font-size:12px;color:#cfcfcf;"></span>
                </div>
                <button id="local-lb-toggle" style="background:transparent;border:1px solid #f0c030;color:#f0c030;width:28px;height:28px;border-radius:4px;font-size:18px;font-weight:700;cursor:pointer;line-height:1;" aria-label="Toggle leaderboard">+</button>
            </div>
            <div id="local-lb-content" style="display:none;padding:0 14px 14px 14px;border-top:1px solid rgba(240,192,48,0.25);"></div>
        `;

        document.body.appendChild(container);
        this.container = container;
        this.headerEl = container.querySelector('#local-lb-header');
        this.toggleBtn = container.querySelector('#local-lb-toggle');
        this.contentEl = container.querySelector('#local-lb-content');
        this.previewEl = container.querySelector('#local-lb-preview');

        this.headerEl.addEventListener('click', (e) => {
            if (e.target === this.toggleBtn) return;
            this.toggle();
        });
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        this.mounted = true;
        this._updatePreview();
    }

    toggle() {
        if (!this.mounted) return;
        this.isOpen = !this.isOpen;
        this.contentEl.style.display = this.isOpen ? 'block' : 'none';
        this.toggleBtn.textContent = this.isOpen ? '−' : '+';
        if (this.isOpen) this._render();
    }

    open() {
        if (!this.isOpen) this.toggle();
    }

    getScores() {
        const raw = localStorage.getItem(this.storageKey);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    submitScore(user, score) {
        const name = (user || '').toString().trim() || 'Anonymous';
        const numScore = Number(score);
        if (!Number.isFinite(numScore)) return null;

        const entry = {
            id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            payload: { user: name, score: numScore, gameName: this.gameName },
            timestamp: new Date().toISOString(),
        };

        const all = this.getScores();
        all.push(entry);
        all.sort((a, b) => (b.payload?.score || 0) - (a.payload?.score || 0));
        const trimmed = all.slice(0, this.maxEntries);
        localStorage.setItem(this.storageKey, JSON.stringify(trimmed));

        if (this.mounted) {
            this._updatePreview();
            if (this.isOpen) this._render();
        }
        return entry;
    }

    getTopScores(n = this.topN) {
        return this.getScores().slice(0, n);
    }

    clear() {
        localStorage.removeItem(this.storageKey);
        if (this.mounted) {
            this._updatePreview();
            if (this.isOpen) this._render();
        }
    }

    _updatePreview() {
        if (!this.previewEl) return;
        const top = this.getScores()[0];
        if (top) {
            const user = this._escape(top.payload?.user ?? 'Anonymous');
            const score = Number(top.payload?.score ?? 0).toLocaleString();
            this.previewEl.textContent = `High: ${user} — ${score}`;
        } else {
            this.previewEl.textContent = 'No scores yet';
        }
    }

    _render() {
        if (!this.contentEl) return;
        const scores = this.getTopScores();

        if (!scores.length) {
            this.contentEl.innerHTML = `<div style="padding:14px 0;text-align:center;color:#999;font-style:italic;">No scores yet — be the first!</div>`;
            return;
        }

        let html = `
            <div style="font-size:12px;font-weight:700;color:#f0c030;text-align:center;padding:10px 0 6px;letter-spacing:1px;">TOP ${scores.length}</div>
            <table style="width:100%;border-collapse:collapse;font-size:13px;color:#e8e0d8;">
                <thead>
                    <tr style="border-bottom:1px solid rgba(240,192,48,0.3);">
                        <th style="text-align:left;padding:4px 6px;font-weight:600;">#</th>
                        <th style="text-align:left;padding:4px 6px;font-weight:600;">Player</th>
                        <th style="text-align:right;padding:4px 6px;font-weight:600;">${this._escape(this.scoreLabel)}</th>
                    </tr>
                </thead>
                <tbody>`;

        scores.forEach((e, i) => {
            const user = this._escape(e.payload?.user ?? 'Anonymous');
            const score = Number(e.payload?.score ?? 0).toLocaleString();
            html += `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:4px 6px;color:#f0c030;font-weight:700;">${i + 1}</td>
                    <td style="padding:4px 6px;">${user}</td>
                    <td style="padding:4px 6px;text-align:right;font-weight:700;">${score}</td>
                </tr>`;
        });

        html += `</tbody></table>`;
        this.contentEl.innerHTML = html;
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.mounted = false;
    }

    _escape(str = '') {
        return String(str).replace(/[&<>"']/g, m =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])
        );
    }
}
