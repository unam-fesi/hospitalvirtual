// Tarjeta de evaluación final por competencias.
export function renderReport(bodyEl, report, caseObj, notes, { onRetry, onClose }) {
  const comps = report.comps.map((c) => {
    const col = c.pct >= 85 ? 'var(--good)' : c.pct >= 50 ? 'var(--warn)' : 'var(--bad)';
    return `<div class="comp"><div class="top"><span>${c.name}</span><span>${c.pct}%</span></div>
      <div class="track"><i style="width:${c.pct}%;background:${col}"></i></div></div>`;
  }).join('');

  const aiNotes = (notes && notes.length)
    ? notes.map((n) => `• ${n}`).join('<br>')
    : (report.weak.length
        ? `<b>A reforzar:</b> ${report.weak.join(', ')}. Repasa la GPC correspondiente y repite el caso.`
        : 'Mantuviste un enfoque sistemático y seguro durante todo el caso.');

  bodyEl.innerHTML = `
    <div class="report">
      <div class="guideline">📕 Basado en <b>${caseObj.guideline || 'GPC IMSS'}</b></div>
      <div class="score" style="color:${report.color}">${report.pct}%</div>
      <div class="grade">${report.grade} · ${report.score}/${report.max} pts</div>
      ${comps}
      <div class="ai">
        <b>Retroalimentación de la IA</b> <span class="badge">Gemini · GPC IMSS</span><br><br>
        ${report.strong.length ? `<b>Fortalezas:</b> ${report.strong.join(', ')}.<br><br>` : ''}
        ${aiNotes}
      </div>
      <div class="controls" style="margin-top:16px">
        <button class="btn primary" id="rep-retry">↻ Repetir caso</button>
        <button class="btn" id="rep-close">Volver al hospital</button>
      </div>
    </div>`;
  bodyEl.querySelector('#rep-retry').onclick = onRetry;
  bodyEl.querySelector('#rep-close').onclick = onClose;
}
