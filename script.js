```javascript
totalAllEl.textContent = inr.format(all);
totalMonthEl.textContent = inr.format(monthTotal);
entriesCountEl.textContent = String(expenses.length);
}


function addExpense(data){
expenses.push({ id: genId(), date: data.date, desc: data.desc, category: data.category, amount: Number(data.amount) });
save(); render();
}
function updateExpense(id, data){
const idx = expenses.findIndex(e => e.id === id);
if (idx === -1) return;
expenses[idx] = { ...expenses[idx], ...data, amount: Number(data.amount) };
save(); render(); cancelEdit();
}
function deleteExpense(id){ if (!confirm('Delete this expense?')) return; expenses = expenses.filter(e => e.id !== id); save(); render(); }


function startEdit(id){
const e = expenses.find(x => x.id === id); if (!e) return;
editingId = id; dateEl.value = e.date; descEl.value = e.desc; catEl.value = e.category; amtEl.value = e.amount;
submitBtn.textContent = 'Update'; cancelEditBtn.hidden = false; descEl.focus();
}
function cancelEdit(){ editingId = null; form.reset(); dateEl.value = todayISO(); submitBtn.textContent = 'Add'; cancelEditBtn.hidden = true; }


form.addEventListener('submit', (ev) => {
ev.preventDefault();
const data = { date: dateEl.value || todayISO(), desc: descEl.value.trim(), category: catEl.value, amount: amtEl.value };
if (!data.desc || !data.amount) return;
if (editingId) updateExpense(editingId, data); else addExpense(data);
form.reset(); dateEl.value = todayISO(); descEl.focus();
});


cancelEditBtn.addEventListener('click', cancelEdit);


tbody.addEventListener('click', (ev) => {
const t = ev.target; const delId = t.getAttribute('data-del'); const editId = t.getAttribute('data-edit');
if (delId) deleteExpense(delId); if (editId) startEdit(editId);
});


[qEl, fcatEl, fromEl, toEl].forEach(el => el.addEventListener('input', render));
clearFiltersBtn.addEventListener('click', () => { qEl.value=''; fcatEl.value=''; fromEl.value=''; toEl.value=''; render(); });


exportBtn.addEventListener('click', () => {
const rows = [['Date','Description','Category','Amount'], ...expenses.map(e => [e.date, e.desc, e.category, e.amount])];
const csv = rows.map(r => r.map(x => '"' + String(x).replace(/"/g,'""') + '"').join(',')).join('
');
const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'expenses.csv'; a.click(); URL.revokeObjectURL(a.href);
});


clearAllBtn.addEventListener('click', () => { if (!confirm('This will delete ALL expenses. Continue?')) return; expenses = []; save(); render(); cancelEdit(); });


// init
load(); if (!Array.isArray(expenses)) expenses = [];
populateCategories(); dateEl.value = todayISO(); render();
```


---


**Notes:**
- If your GitHub Pages is configured to use `docs/`, put these three files inside the `docs/` folder.
- The select boxes show emoji + text for clarity; the table shows only the emoji chip (hover to see the category name).