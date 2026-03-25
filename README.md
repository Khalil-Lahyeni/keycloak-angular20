// styles.scss — styles globaux application

// ── Reset ──
*, *::before, *::after {
  box-sizing: border-box;
  margin:     0;
  padding:    0;
}

// ── Base ──
html, body {
  height:      100%;
  overflow:    hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-size:   14px;
  color:       #1e293b;
  background:  #f8fafc;
}

// ── Scrollbar ──
::-webkit-scrollbar        { width: 6px; }
::-webkit-scrollbar-track  { background: #f1f5f9; }
::-webkit-scrollbar-thumb  { background: #cbd5e1; border-radius: 3px; }
