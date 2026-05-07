export default class LocalLeaderboard {
    constructor(gameName = 'Global', options = {}) {
        this.gameName = gameName;
        this.storageKey = `score_counter_${gameName}`;
        this.maxEntries = options.maxEntries || 50;
        this.topN = options.topN || 5;
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
        return entry;
    }

    getTopScores(n = this.topN) {
        return this.getScores().slice(0, n);
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }

    renderInto(container, n = this.topN) {
        if (!container) return;
        const scores = this.getTopScores(n);

        if (!scores.length) {
            container.innerHTML = `<div style="color:#999;font-style:italic;text-align:center;padding:8px;">No scores yet — be the first!</div>`;
            return;
        }

        let html = `
            <div style="font-size:13px;font-weight:700;color:#f0c030;text-align:center;margin-bottom:6px;letter-spacing:1px;">TOP ${scores.length}</div>
            <table style="width:100%;border-collapse:collapse;font-size:13px;color:#e8e0d8;">
                <thead>
                    <tr style="border-bottom:1px solid rgba(240,192,48,0.3);">
                        <th style="text-align:left;padding:4px 6px;font-weight:600;">#</th>
                        <th style="text-align:left;padding:4px 6px;font-weight:600;">Player</th>
                        <th style="text-align:right;padding:4px 6px;font-weight:600;">Coins</th>
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
        container.innerHTML = html;
    }

    _escape(str = '') {
        return String(str).replace(/[&<>"']/g, m =>
            ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m])
        );
    }
}
