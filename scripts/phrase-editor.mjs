/**
 * Phrase Editor — developer tool for managing src/phrases.ts
 * Run with: npm run phrases
 * Opens a local web UI at http://localhost:3777
 */

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { exec } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PHRASES_FILE = path.resolve(__dirname, '../src/phrases.ts')
const PORT = 3777

// ---------------------------------------------------------------------------
// Parse / Serialize
// ---------------------------------------------------------------------------

/** Parse phrases.ts into a flat list of {type:'comment'|'phrase', ...} entries */
function parsePhrasesFile(content) {
  const lines = content.split('\n')
  const entries = []
  let inArray = false

  for (const line of lines) {
    if (/const phrases[\s\w:[\]]*=\s*\[/.test(line)) { inArray = true; continue }
    if (!inArray) continue
    if (/^\s*\]/.test(line)) break

    const trimmed = line.trim()
    if (trimmed === '') continue // normalize blank lines on write-back
    if (trimmed.startsWith('//')) {
      entries.push({ type: 'comment', text: trimmed })
    } else {
      const match = trimmed.match(/^'((?:[^'\\]|\\.)*)',?\s*$/)
      if (match) {
        entries.push({ type: 'phrase', value: match[1].replace(/\\'/g, "'") })
      }
    }
  }
  return entries
}

/** Serialize entries back to valid phrases.ts content */
function entriesToFileContent(entries) {
  const lines = ['const phrases: string[] = [']
  let isFirstEntry = true

  for (const entry of entries) {
    if (entry.type === 'comment') {
      if (!isFirstEntry) lines.push('') // blank line before each section
      lines.push('  ' + entry.text)
      isFirstEntry = false
    } else if (entry.type === 'phrase') {
      const escaped = entry.value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
      lines.push("  '" + escaped + "',")
      isFirstEntry = false
    }
  }

  lines.push(']', '', 'export default phrases', '')
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Embedded HTML app
// ---------------------------------------------------------------------------

const HTML = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Phrase Editor</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f0f2f5; color: #111; }

    .toolbar {
      position: sticky; top: 0; z-index: 100;
      background: #1a1a2e; color: white;
      padding: 10px 16px;
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .toolbar h1 { font-size: 1rem; font-weight: 700; white-space: nowrap; }
    .toolbar input[type="search"] {
      flex: 1; min-width: 160px;
      padding: 6px 10px; border-radius: 6px; border: none;
      font-size: 0.95rem; direction: rtl;
    }
    .toolbar select {
      padding: 6px 8px; border-radius: 6px; border: none;
      font-size: 0.85rem; cursor: pointer; background: white;
    }
    .count { font-size: 0.82rem; color: #9e9ec0; white-space: nowrap; }
    .spacer { flex: 1; }
    #dupInfo { font-size: 0.82rem; color: #ffcc80; white-space: nowrap; }
    #removeDupBtn {
      padding: 5px 11px; border: none; border-radius: 6px;
      font-size: 0.82rem; cursor: pointer;
      background: #ff7043; color: white; white-space: nowrap; display: none;
    }
    #removeDupBtn:hover { background: #e64a19; }
    #revertBtn {
      padding: 6px 12px; border: none; border-radius: 6px;
      font-size: 0.88rem; cursor: pointer;
      background: #555; color: white; display: none; white-space: nowrap;
    }
    #saveBtn {
      padding: 6px 16px; border: none; border-radius: 6px;
      font-size: 0.88rem; font-weight: 700; cursor: pointer;
      background: #4caf50; color: white; transition: opacity .15s;
      white-space: nowrap;
    }
    #saveBtn:disabled { opacity: .4; cursor: default; }
    #saveBtn.saved { background: #2196f3; }

    .banner {
      background: #ff9800; color: #fff; text-align: center;
      padding: 5px 16px; font-size: 0.82rem; display: none;
    }
    .banner.on { display: block; }

    .content { max-width: 680px; margin: 0 auto; padding: 12px 16px 40px; }

    .section-header {
      font-size: 0.72rem; font-weight: 700; color: #777;
      letter-spacing: .06em; text-transform: uppercase;
      padding: 14px 4px 5px; border-bottom: 1px solid #ddd;
      margin-bottom: 4px; cursor: pointer; display: flex;
      align-items: center; gap: 6px;
    }
    .section-header:hover .hdr-text { color: #333; text-decoration: underline dotted; }
    .section-header.hidden { display: none; }
    .hdr-edit-hint { font-size: .65rem; color: #bbb; font-weight: 400; letter-spacing: 0; text-transform: none; }
    .hdr-count { font-size: .7rem; color: #aaa; font-weight: 400; letter-spacing: 0; text-transform: none; background: #eee; border-radius: 10px; padding: 1px 7px; }
    .grp-toggle-btn {
      font-size: .75rem; background: none; border: none; cursor: pointer;
      color: #999; padding: 1px 5px; border-radius: 3px; line-height: 1;
      font-weight: 400; letter-spacing: 0; text-transform: none; transition: color .1s;
    }
    .grp-toggle-btn:hover { color: #333; background: #eee; }
    .section-header.collapsed .hdr-text { color: #aaa; }
    .collapse-all-btn, .expand-all-btn {
      padding: 4px 10px; border: none; border-radius: 6px;
      font-size: 0.78rem; cursor: pointer; white-space: nowrap;
      background: #333; color: #ccc;
    }
    .collapse-all-btn:hover, .expand-all-btn:hover { background: #444; color: white; }
    .combine-btn {
      font-size: .68rem; color: #7986cb; font-weight: 400; letter-spacing: 0;
      text-transform: none; background: none; border: 1px solid #7986cb;
      border-radius: 4px; padding: 1px 7px; cursor: pointer; white-space: nowrap;
      margin-right: 6px;
    }
    .combine-btn:hover { background: #e8eaf6; color: #3949ab; border-color: #3949ab; }
    .grp-move-btn {
      font-size: .75rem; background: none; border: none; cursor: pointer;
      color: #bbb; padding: 1px 5px; border-radius: 3px; line-height: 1;
      font-weight: 400; letter-spacing: 0; text-transform: none;
    }
    .grp-move-btn:hover { color: #555; background: #eee; }
    .new-group-row {
      display: flex; align-items: center; gap: 8px;
      margin: 20px 0 8px; padding-top: 16px;
      border-top: 2px dashed #ccc;
    }
    .new-group-btn {
      font-size: .85rem; color: #388e3c;
      background: none; border: 1px dashed #388e3c;
      border-radius: 6px; padding: 5px 14px; cursor: pointer;
    }
    .new-group-btn:hover { background: #e8f5e9; }
    .new-group-input {
      flex: 1; font-size: .9rem; padding: 5px 8px;
      border: 1px solid #388e3c; border-radius: 6px;
      direction: rtl; display: none;
    }
    .new-group-input.on { display: block; }
    .new-group-confirm {
      font-size: .85rem; background: #388e3c; color: white;
      border: none; border-radius: 6px; padding: 5px 12px;
      cursor: pointer; display: none;
    }
    .new-group-confirm.on { display: block; }
    .section-header-input {
      font-size: .8rem; font-weight: 700; letter-spacing: .04em;
      border: 1px solid #888; border-radius: 4px; padding: 2px 6px;
      flex: 1; direction: rtl; outline: none; background: white; color: #333;
    }

    .phrase-row {
      display: flex; align-items: center; gap: 5px;
      padding: 4px 6px; border-radius: 6px;
      background: white; margin-bottom: 3px;
      border: 1px solid #e8e8e8;
    }
    .phrase-row:hover { border-color: #bbb; }
    .phrase-row.editing { border-color: #1976d2; box-shadow: 0 0 0 2px #1976d220; }
    .phrase-row.hidden { display: none; }
    .phrase-row.duplicate { background: #fff8e1; border-color: #ffc107; }
    .phrase-row.duplicate:hover { border-color: #ff9800; }

    .phrase-text {
      flex: 1; cursor: pointer; font-size: .98rem;
      padding: 2px 4px; border-radius: 4px;
    }
    .phrase-text:hover { background: #f0f4ff; }
    .duplicate .phrase-text:hover { background: #fff0c0; }

    .phrase-input {
      flex: 1; font-size: .98rem; padding: 2px 6px;
      border: 1px solid #1976d2; border-radius: 4px;
      direction: rtl; outline: none;
    }

    .wbadge {
      font-size: .68rem; color: #aaa;
      min-width: 18px; text-align: center;
    }
    .dup-mark { font-size: .68rem; color: #e65100; font-weight: 700; }

    .icon-btn {
      background: none; border: none; cursor: pointer;
      color: #ccc; font-size: .9rem; padding: 2px 4px;
      border-radius: 4px; line-height: 1;
    }
    .icon-btn:hover { color: #444; background: #f0f0f0; }
    .del-btn:hover { color: #e53935; background: #ffeaea; }
    .move-btn:hover { color: #1976d2; background: #e3f2fd; }

    .move-select {
      font-size: .8rem; padding: 2px 4px; border-radius: 4px;
      border: 1px solid #1976d2; direction: rtl;
      max-width: 140px; background: white; cursor: pointer;
    }

    .add-row {
      display: flex; align-items: center; gap: 6px;
      margin: 4px 0 10px;
    }
    .add-row.hidden { display: none; }
    .add-btn {
      font-size: .8rem; color: #1976d2;
      background: none; border: 1px dashed #1976d2;
      border-radius: 6px; padding: 3px 10px; cursor: pointer;
    }
    .add-btn:hover { background: #e3f2fd; }
    .add-input {
      flex: 1; font-size: .9rem; padding: 4px 8px;
      border: 1px solid #1976d2; border-radius: 6px;
      direction: rtl; display: none;
    }
    .add-input.on { display: block; }
    .add-confirm {
      font-size: .8rem; background: #1976d2; color: white;
      border: none; border-radius: 6px; padding: 4px 10px;
      cursor: pointer; display: none;
    }
    .add-confirm.on { display: block; }
  </style>
</head>
<body>
  <div class="toolbar">
    <h1>✏️ Phrase Editor</h1>
    <input type="search" id="search" placeholder="חיפוש..." autocomplete="off" />
    <select id="wfilter">
      <option value="all">כל הביטויים</option>
      <option value="1">מילה אחת</option>
      <option value="2">שתי מילים</option>
      <option value="3">3+ מילים</option>
    </select>
    <span class="count" id="count">טוען...</span>
    <span class="spacer"></span>
    <span id="dupInfo"></span>
    <button id="removeDupBtn">הסר כפולים</button>
    <button class="collapse-all-btn" id="collapseAllBtn">כווץ הכל</button>
    <button class="expand-all-btn" id="expandAllBtn">פתח הכל</button>
    <button id="revertBtn">בטל שינויים</button>
    <button id="saveBtn" disabled>שמור</button>
  </div>
  <div class="banner" id="banner">שינויים לא שמורים — Cmd+S לשמירה</div>
  <div class="content" id="content"></div>

<script>
var entries = [];
var savedEntries = [];
var collapsed = {}; // comment text → true when collapsed

function wordCount(s) {
  return s.trim().split(/\\s+/).length;
}

function getQ() { return document.getElementById('search').value.trim().toLowerCase(); }
function getWF() { return document.getElementById('wfilter').value; }

function matches(value) {
  var q = getQ(), wf = getWF(), wc = wordCount(value);
  if (q && value.toLowerCase().indexOf(q) === -1) return false;
  if (wf === '1' && wc !== 1) return false;
  if (wf === '2' && wc !== 2) return false;
  if (wf === '3' && wc < 3) return false;
  return true;
}

function setDirty(val) {
  var saveBtn = document.getElementById('saveBtn');
  var revertBtn = document.getElementById('revertBtn');
  var banner = document.getElementById('banner');
  if (val) {
    saveBtn.disabled = false;
    saveBtn.textContent = 'שמור';
    saveBtn.classList.remove('saved');
    revertBtn.style.display = 'block';
    banner.classList.add('on');
  } else {
    saveBtn.disabled = true;
    revertBtn.style.display = 'none';
    banner.classList.remove('on');
  }
}

// Returns {dupValues: {normalizedValue: true}, numDupGroups: N}
function calcDuplicates() {
  var counts = {};
  for (var k = 0; k < entries.length; k++) {
    if (entries[k].type === 'phrase') {
      var v = entries[k].value.toLowerCase();
      counts[v] = (counts[v] || 0) + 1;
    }
  }
  var dupValues = {}, numDupGroups = 0;
  for (var v in counts) {
    if (counts[v] > 1) { dupValues[v] = counts[v]; numDupGroups++; }
  }
  return { dupValues: dupValues, numDupGroups: numDupGroups };
}

function removeEmptyGroups() {
  var result = [];
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].type === 'comment') {
      var hasPhrase = false;
      for (var j = i + 1; j < entries.length && entries[j].type !== 'comment'; j++) {
        if (entries[j].type === 'phrase') { hasPhrase = true; break; }
      }
      if (hasPhrase) result.push(entries[i]);
    } else {
      result.push(entries[i]);
    }
  }
  entries.length = 0;
  for (var k = 0; k < result.length; k++) entries.push(result[k]);
}

function render() {
  var content = document.getElementById('content');
  var q = getQ(), wf = getWF();
  var isFiltering = q || wf !== 'all';
  var visCount = 0, totalCount = 0;

  for (var k = 0; k < entries.length; k++) {
    if (entries[k].type === 'phrase') {
      totalCount++;
      if (matches(entries[k].value)) visCount++;
    }
  }

  var countEl = document.getElementById('count');
  countEl.textContent = isFiltering
    ? (visCount + ' מתוך ' + totalCount + ' ביטויים')
    : (totalCount + ' ביטויים');

  // Duplicates
  var dc = calcDuplicates();
  var dupInfo = document.getElementById('dupInfo');
  var removeDupBtn = document.getElementById('removeDupBtn');
  if (dc.numDupGroups > 0) {
    dupInfo.textContent = dc.numDupGroups + ' ביטויים כפולים';
    removeDupBtn.style.display = 'block';
  } else {
    dupInfo.textContent = '';
    removeDupBtn.style.display = 'none';
  }

  var frag = document.createDocumentFragment();
  var i = 0;

  while (i < entries.length) {
    var e = entries[i];

    if (e.type === 'comment') {
      var sectionHasVisible = false;
      var sectionTotal = 0;
      for (var j = i + 1; j < entries.length && entries[j].type !== 'comment'; j++) {
        if (entries[j].type === 'phrase') {
          sectionTotal++;
          if (matches(entries[j].value)) sectionHasVisible = true;
        }
      }

      var hdr = makeGroupHeader(i, e.text, isFiltering && !sectionHasVisible, sectionTotal, !!collapsed[e.text]);
      frag.appendChild(hdr);

      var commentIdx = i;
      var isCollapsed = !!collapsed[e.text];
      i++;

      while (i < entries.length && entries[i].type !== 'comment') {
        if (entries[i].type === 'phrase' && !isCollapsed) {
          var vis = matches(entries[i].value);
          var isDup = !!dc.dupValues[entries[i].value.toLowerCase()];
          frag.appendChild(makePhraseRow(i, entries[i].value, isFiltering && !vis, isDup));
        }
        i++;
      }

      if (!isFiltering && !isCollapsed) frag.appendChild(makeAddRow(commentIdx));

    } else if (e.type === 'phrase') {
      var vis2 = matches(e.value);
      var isDup2 = !!dc.dupValues[e.value.toLowerCase()];
      frag.appendChild(makePhraseRow(i, e.value, isFiltering && !vis2, isDup2));
      i++;
    } else {
      i++;
    }
  }

  if (!isFiltering) {
    var globalAdd = makeAddRow(-1);
    globalAdd.querySelector('.add-btn').textContent = '+ הוסף לסוף הרשימה';
    frag.appendChild(globalAdd);
  }

  frag.appendChild(makeNewGroupRow());

  content.innerHTML = '';
  content.appendChild(frag);
}

function makeGroupHeader(idx, text, hidden, count, isCollapsed) {
  var hdr = document.createElement('div');
  var cls = 'section-header' + (hidden ? ' hidden' : '') + (isCollapsed ? ' collapsed' : '');
  hdr.className = cls;

  // Chevron toggle (rightmost in RTL)
  var chevron = document.createElement('button');
  chevron.className = 'grp-toggle-btn';
  chevron.textContent = isCollapsed ? '▶' : '▼';
  chevron.title = isCollapsed ? 'פתח קבוצה' : 'כווץ קבוצה';
  chevron.onclick = function(ev) { ev.stopPropagation(); collapsed[text] = !collapsed[text]; render(); };

  var textSpan = document.createElement('span');
  textSpan.className = 'hdr-text';
  textSpan.textContent = text.replace(/^\\/\\/ ?/, '');

  var hint = document.createElement('span');
  hint.className = 'hdr-edit-hint';
  hint.textContent = '(לחץ לעריכה)';

  var countBadge = document.createElement('span');
  countBadge.className = 'hdr-count';
  countBadge.textContent = count;

  hdr.appendChild(chevron);
  hdr.appendChild(textSpan);
  hdr.appendChild(countBadge);
  hdr.appendChild(hint);

  // Combine-with button
  var combineBtn = document.createElement('button');
  combineBtn.className = 'combine-btn';
  combineBtn.textContent = '⊕ שלב עם...';
  combineBtn.onclick = function(ev) {
    ev.stopPropagation();
    var sourceText = entries[idx].text;
    var sel = document.createElement('select');
    sel.className = 'move-select';
    var ph = document.createElement('option');
    ph.value = ''; ph.textContent = '— בחר קבוצה יעד —';
    sel.appendChild(ph);
    for (var si = 0; si < entries.length; si++) {
      if (entries[si].type === 'comment' && si !== idx) {
        var opt = document.createElement('option');
        opt.value = entries[si].text;
        opt.textContent = entries[si].text.replace(/^\\/\\/ ?/, '');
        sel.appendChild(opt);
      }
    }
    combineBtn.replaceWith(sel);
    sel.focus();
    sel.onchange = function() {
      if (sel.value) combineGroups(sourceText, sel.value);
      else render();
    };
    sel.onblur = function() { setTimeout(render, 100); };
  };
  hdr.appendChild(combineBtn);

  // Group reorder buttons
  var btnGrpUp = document.createElement('button');
  btnGrpUp.className = 'grp-move-btn'; btnGrpUp.textContent = '↑'; btnGrpUp.title = 'הזז קבוצה למעלה';
  btnGrpUp.onclick = function(ev) { ev.stopPropagation(); moveGroup(idx, -1); };

  var btnGrpDown = document.createElement('button');
  btnGrpDown.className = 'grp-move-btn'; btnGrpDown.textContent = '↓'; btnGrpDown.title = 'הזז קבוצה למטה';
  btnGrpDown.onclick = function(ev) { ev.stopPropagation(); moveGroup(idx, 1); };

  hdr.appendChild(btnGrpUp);
  hdr.appendChild(btnGrpDown);

  hdr.onclick = function(ev) {
    if (hdr.querySelector('.section-header-input')) return; // already editing
    startGroupEdit(hdr, idx, textSpan);
  };
  return hdr;
}

function startGroupEdit(hdr, idx, textSpan) {
  var inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'section-header-input';
  inp.value = entries[idx].text.replace(/^\\/\\/ ?/, '');
  inp.dir = 'rtl';

  hdr.innerHTML = '';
  hdr.appendChild(inp);
  inp.focus(); inp.select();

  function finish() {
    var v = inp.value.trim();
    if (v && v !== entries[idx].text.replace(/^\\/\\/ ?/, '')) {
      entries[idx] = { type: 'comment', text: '// ' + v };
      setDirty(true);
    }
    render();
  }

  inp.onblur = finish;
  inp.onkeydown = function(e) {
    if (e.key === 'Enter') inp.blur();
    if (e.key === 'Escape') render();
  };
  // Prevent hdr onclick from firing while input is open
  inp.onclick = function(e) { e.stopPropagation(); };
}

function makePhraseRow(idx, value, hidden, isDup) {
  var row = document.createElement('div');
  var cls = 'phrase-row';
  if (hidden) cls += ' hidden';
  if (isDup) cls += ' duplicate';
  row.className = cls;

  var btnUp = document.createElement('button');
  btnUp.className = 'icon-btn'; btnUp.textContent = '↑'; btnUp.title = 'הזז למעלה';
  btnUp.onclick = (function(ii) { return function() { movePhrase(ii, -1); }; })(idx);

  var btnDown = document.createElement('button');
  btnDown.className = 'icon-btn'; btnDown.textContent = '↓'; btnDown.title = 'הזז למטה';
  btnDown.onclick = (function(ii) { return function() { movePhrase(ii, 1); }; })(idx);

  var span = document.createElement('span');
  span.className = 'phrase-text';
  span.textContent = value;
  span.onclick = (function(ii, s, r) { return function() { startEdit(r, ii, s); }; })(idx, span, row);

  var badge = document.createElement('span');
  badge.className = 'wbadge';
  var wc = wordCount(value);
  badge.textContent = wc + 'מ';
  badge.title = wc + ' מילים';

  if (isDup) {
    var dupMark = document.createElement('span');
    dupMark.className = 'dup-mark'; dupMark.textContent = '⚠'; dupMark.title = 'ביטוי כפול';
    row.appendChild(btnUp); row.appendChild(btnDown); row.appendChild(span);
    row.appendChild(dupMark); row.appendChild(badge);
  } else {
    row.appendChild(btnUp); row.appendChild(btnDown); row.appendChild(span);
    row.appendChild(badge);
  }

  // Move-to-group button
  var btnMove = document.createElement('button');
  btnMove.className = 'icon-btn move-btn'; btnMove.textContent = '⤴'; btnMove.title = 'העבר לקבוצה';
  btnMove.onclick = (function(ii) {
    return function(ev) {
      ev.stopPropagation();
      var sel = document.createElement('select');
      sel.className = 'move-select';
      var placeholder = document.createElement('option');
      placeholder.value = ''; placeholder.textContent = '— בחר קבוצה —';
      sel.appendChild(placeholder);
      for (var si = 0; si < entries.length; si++) {
        if (entries[si].type === 'comment') {
          var opt = document.createElement('option');
          opt.value = si;
          opt.textContent = entries[si].text.replace(/^\\/\\/ ?/, '');
          sel.appendChild(opt);
        }
      }
      btnMove.replaceWith(sel);
      sel.focus();
      sel.onchange = function() {
        var targetIdx = parseInt(sel.value, 10);
        if (!isNaN(targetIdx)) moveToGroup(ii, targetIdx);
        else render();
      };
      sel.onblur = function() { setTimeout(render, 100); };
    };
  })(idx);

  var btnDel = document.createElement('button');
  btnDel.className = 'icon-btn del-btn'; btnDel.textContent = '✕'; btnDel.title = 'מחק';
  btnDel.onclick = (function(ii) { return function() { deletePhrase(ii); }; })(idx);

  row.appendChild(btnMove);
  row.appendChild(btnDel);
  return row;
}

function makeAddRow(afterCommentIdx) {
  var row = document.createElement('div');
  row.className = 'add-row';

  var btn = document.createElement('button');
  btn.className = 'add-btn'; btn.textContent = '+ הוסף ביטוי';

  var inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'add-input';
  inp.placeholder = 'הקלד ביטוי חדש...'; inp.dir = 'rtl';

  var confirmBtn = document.createElement('button');
  confirmBtn.className = 'add-confirm'; confirmBtn.textContent = '✓ הוסף';

  btn.onclick = function() {
    btn.style.display = 'none';
    inp.classList.add('on');
    confirmBtn.classList.add('on');
    inp.focus();
  };

  function doAdd() {
    var val = inp.value.trim();
    btn.style.display = '';
    inp.classList.remove('on');
    confirmBtn.classList.remove('on');
    inp.value = '';
    if (val) addPhrase(val, afterCommentIdx);
  }

  confirmBtn.onclick = doAdd;
  inp.onkeydown = function(e) {
    if (e.key === 'Enter') doAdd();
    if (e.key === 'Escape') {
      btn.style.display = '';
      inp.classList.remove('on');
      confirmBtn.classList.remove('on');
      inp.value = '';
    }
  };

  row.appendChild(btn);
  row.appendChild(inp);
  row.appendChild(confirmBtn);
  return row;
}

function startEdit(row, idx, span) {
  row.classList.add('editing');
  var inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'phrase-input';
  inp.value = entries[idx].value;
  span.replaceWith(inp);
  inp.focus(); inp.select();

  function finish() {
    var v = inp.value.trim();
    if (v && v !== entries[idx].value) {
      entries[idx] = { type: 'phrase', value: v };
      setDirty(true);
    }
    row.classList.remove('editing');
    render();
  }

  inp.onblur = finish;
  inp.onkeydown = function(e) {
    if (e.key === 'Enter') inp.blur();
    if (e.key === 'Escape') { row.classList.remove('editing'); render(); }
  };
}

function deletePhrase(idx) {
  entries.splice(idx, 1);
  removeEmptyGroups();
  setDirty(true); render();
}

function movePhrase(idx, dir) {
  var t = idx + dir;
  if (t < 0 || t >= entries.length) return;
  var tmp = entries[idx]; entries[idx] = entries[t]; entries[t] = tmp;
  setDirty(true); render();
}

function addPhrase(value, afterCommentIdx) {
  var newEntry = { type: 'phrase', value: value };
  if (afterCommentIdx === -1) {
    entries.push(newEntry);
  } else {
    var ins = afterCommentIdx + 1;
    while (ins < entries.length && entries[ins].type !== 'comment') ins++;
    entries.splice(ins, 0, newEntry);
  }
  setDirty(true); render();
}

function moveToGroup(phraseIdx, targetCommentIdx) {
  // Capture target by text to stay stable after splice
  var targetText = entries[targetCommentIdx].text;
  var phrase = entries.splice(phraseIdx, 1)[0];
  // Re-find target comment (index may have shifted)
  var newTarget = -1;
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].type === 'comment' && entries[i].text === targetText) {
      newTarget = i; break;
    }
  }
  if (newTarget === -1) {
    entries.push(phrase);
  } else {
    var ins = newTarget + 1;
    while (ins < entries.length && entries[ins].type !== 'comment') ins++;
    entries.splice(ins, 0, phrase);
  }
  removeEmptyGroups();
  setDirty(true); render();
}

function combineGroups(sourceText, targetText) {
  // Collect all phrases from the source section
  var sourceIdx = -1;
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].type === 'comment' && entries[i].text === sourceText) {
      sourceIdx = i; break;
    }
  }
  if (sourceIdx === -1) { render(); return; }

  var end = sourceIdx + 1;
  while (end < entries.length && entries[end].type !== 'comment') end++;
  var phrases = entries.slice(sourceIdx + 1, end).filter(function(e) { return e.type === 'phrase'; });

  // Remove the source section (comment + everything until next comment)
  entries.splice(sourceIdx, end - sourceIdx);

  // Re-find target by text (index may have shifted after splice)
  var targetIdx = -1;
  for (var j = 0; j < entries.length; j++) {
    if (entries[j].type === 'comment' && entries[j].text === targetText) {
      targetIdx = j; break;
    }
  }

  // Find insertion point: end of target section
  var ins = targetIdx === -1 ? entries.length : targetIdx + 1;
  while (ins < entries.length && entries[ins].type !== 'comment') ins++;

  // Insert all phrases from source at end of target
  for (var k = phrases.length - 1; k >= 0; k--) {
    entries.splice(ins, 0, phrases[k]);
  }

  setDirty(true); render();
}

function moveGroup(commentIdx, dir) {
  // Find extent of this section (its comment + all its phrases)
  var sectionEnd = commentIdx + 1;
  while (sectionEnd < entries.length && entries[sectionEnd].type !== 'comment') sectionEnd++;

  if (dir === -1) {
    // Find the start of the previous section
    var prevCommentIdx = -1;
    for (var i = commentIdx - 1; i >= 0; i--) {
      if (entries[i].type === 'comment') { prevCommentIdx = i; break; }
    }
    if (prevCommentIdx === -1) return; // already first group
    var prevSection = entries.slice(prevCommentIdx, commentIdx);
    var currSection = entries.slice(commentIdx, sectionEnd);
    var rebuilt = entries.slice(0, prevCommentIdx).concat(currSection, prevSection, entries.slice(sectionEnd));
    entries.length = 0;
    for (var k = 0; k < rebuilt.length; k++) entries.push(rebuilt[k]);

  } else {
    if (sectionEnd >= entries.length) return; // already last group
    var nextEnd = sectionEnd + 1;
    while (nextEnd < entries.length && entries[nextEnd].type !== 'comment') nextEnd++;
    var currSection2 = entries.slice(commentIdx, sectionEnd);
    var nextSection = entries.slice(sectionEnd, nextEnd);
    var rebuilt2 = entries.slice(0, commentIdx).concat(nextSection, currSection2, entries.slice(nextEnd));
    entries.length = 0;
    for (var k = 0; k < rebuilt2.length; k++) entries.push(rebuilt2[k]);
  }

  setDirty(true); render();
}

function makeNewGroupRow() {
  var row = document.createElement('div');
  row.className = 'new-group-row';

  var btn = document.createElement('button');
  btn.className = 'new-group-btn'; btn.textContent = '➕ קבוצה חדשה';

  var inp = document.createElement('input');
  inp.type = 'text'; inp.className = 'new-group-input';
  inp.placeholder = 'שם הקבוצה...'; inp.dir = 'rtl';

  var confirmBtn = document.createElement('button');
  confirmBtn.className = 'new-group-confirm'; confirmBtn.textContent = '✓ צור';

  btn.onclick = function() {
    btn.style.display = 'none';
    inp.classList.add('on'); confirmBtn.classList.add('on');
    inp.focus();
  };

  function doCreate() {
    var name = inp.value.trim();
    btn.style.display = '';
    inp.classList.remove('on'); confirmBtn.classList.remove('on');
    inp.value = '';
    if (name) {
      entries.push({ type: 'comment', text: '// ' + name });
      setDirty(true); render();
    }
  }

  confirmBtn.onclick = doCreate;
  inp.onkeydown = function(e) {
    if (e.key === 'Enter') doCreate();
    if (e.key === 'Escape') {
      btn.style.display = '';
      inp.classList.remove('on'); confirmBtn.classList.remove('on');
      inp.value = '';
    }
  };

  row.appendChild(btn); row.appendChild(inp); row.appendChild(confirmBtn);
  return row;
}

function removeDuplicates() {
  var seen = {};
  var result = entries.filter(function(e) {
    if (e.type !== 'phrase') return true;
    var v = e.value.toLowerCase();
    if (seen[v]) return false;
    seen[v] = true;
    return true;
  });
  entries.length = 0;
  for (var i = 0; i < result.length; i++) entries.push(result[i]);
  removeEmptyGroups();
  setDirty(true); render();
}

async function save() {
  var btn = document.getElementById('saveBtn');
  btn.disabled = true; btn.textContent = 'שומר...';
  try {
    var res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entries)
    });
    if (res.ok) {
      savedEntries = JSON.parse(JSON.stringify(entries));
      setDirty(false);
      btn.textContent = 'נשמר ✓'; btn.classList.add('saved'); btn.disabled = true;
      setTimeout(function() { btn.textContent = 'שמור'; btn.classList.remove('saved'); }, 2000);
    } else {
      btn.textContent = 'שגיאה!'; btn.disabled = false;
    }
  } catch(err) {
    btn.textContent = 'שגיאה!'; btn.disabled = false;
  }
}

document.getElementById('saveBtn').onclick = save;
document.getElementById('removeDupBtn').onclick = removeDuplicates;
document.getElementById('collapseAllBtn').onclick = function() {
  for (var i = 0; i < entries.length; i++) {
    if (entries[i].type === 'comment') collapsed[entries[i].text] = true;
  }
  render();
};
document.getElementById('expandAllBtn').onclick = function() {
  collapsed = {};
  render();
};
document.getElementById('revertBtn').onclick = function() {
  entries = JSON.parse(JSON.stringify(savedEntries));
  setDirty(false); render();
};
document.getElementById('search').oninput = render;
document.getElementById('wfilter').onchange = render;
document.addEventListener('keydown', function(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    if (!document.getElementById('saveBtn').disabled) save();
  }
});

fetch('/api/entries').then(function(r) { return r.json(); }).then(function(data) {
  entries = data;
  savedEntries = JSON.parse(JSON.stringify(data));
  render();
});
</script>
</body>
</html>`

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(HTML)

  } else if (req.method === 'GET' && req.url === '/api/entries') {
    try {
      const content = fs.readFileSync(PHRASES_FILE, 'utf8')
      const entries = parsePhrasesFile(content)
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(entries))
    } catch (err) {
      res.writeHead(500)
      res.end(JSON.stringify({ error: err.message }))
    }

  } else if (req.method === 'POST' && req.url === '/api/save') {
    try {
      const body = await readBody(req)
      const entries = JSON.parse(body)
      const content = entriesToFileContent(entries)
      fs.writeFileSync(PHRASES_FILE, content, 'utf8')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (err) {
      res.writeHead(400)
      res.end(JSON.stringify({ error: err.message }))
    }

  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(PORT, '127.0.0.1', () => {
  const url = 'http://localhost:' + PORT
  console.log('Phrase Editor running at ' + url)
  console.log('Editing: ' + PHRASES_FILE)
  console.log('Press Ctrl+C to stop.\n')
  exec('open ' + url)
})

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port ' + PORT + ' is already in use. Is the editor already running?')
  } else {
    console.error(err)
  }
  process.exit(1)
})
