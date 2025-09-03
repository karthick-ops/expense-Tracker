/* Expense Tracker - script.js
   - Stores data in localStorage
   - Categories have emojis
   - Displays emoji chips in the table
*/

const KEY = 'expense-tracker-v1';
let expenses = [];
let editingId = null;

// Categories with emoji
const categories = [
  { name: 'Food', emoji: '🍔' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Bills', emoji: '💡' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Health', emoji: '💊' },
  { name: 'Education', emoji: '📚' },
  { name: 'Travel', emoji: '✈️' },
  { name: 'Groceries', emoji: '🛒' },
  { name: 'Rent', emoji: '🏠' },
  { name: 'Utilities', emoji: '🔌' },
  { name: 'Other', emoji: '📦' }
];

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

// DOM refs
const form = document.getElementById('expense-form');
const dateEl = document.getElementById('date');
const descEl = document.getElementById('desc');
const catEl = document.getElementById('category');
const amtEl = document.getElementById('amount');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit');

const tbody = document.getElementById('tbody');
const qEl = document.getElementById('q');
const fcatEl = document.getElementById('filter-category');
const fromEl = document.getElementById('from');
const toEl = document.getElementById('to');
const clearFiltersBtn = document.getElementById('clear-filters');

const totalMonthEl = document.getElementById('total-month');
const totalAllEl = document.getElementById('total-all');
const entriesCountEl = document.getElementById('entries-count');

const exportBtn = document.getElementById('export-csv');
const clearAllBtn = document.getElementById('clear-all');

// Helpers
function todayISO(){ return new Date().toISOString().slice(0,10); }
function genId(){ return 'e' + Math.random().toString(36).slice(2,9) + Date.now().toString(36); }

function load(){ try{ expenses = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch{ expenses = []; } }
function save(){ localStorage.setItem(KEY, JSON.stringify(expenses)); }

function escapeHtml(s){ return String(s).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[c])); }

// Populate categories in select
function populateCategories(){
  catEl.innerHTML = '';
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.innerText = `${c.emoji} ${c.name}`;
    catEl.appendChild(opt);
  });

  fcatEl.innerHTML = '<option value=\"\">All categories</option>';
  categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.name;
    opt.innerText = `${c.emoji} ${c.name}`;
    fcatEl.appendChild(opt);
  });
}

// Render expenses in table
function render(){
  const q = qEl.value.trim().toLowerCase();
  const fcat = fcatEl.value;
  const from = fromEl.value ? new Date(fromEl.value) : null;
  const to = toEl.value ? new Date(toEl.value) : null;

  const filtered = expenses.filter(e => {
    const matchText = !q || e.desc.toLowerCase().includes(q);
    const matchCat = !fcat || e.category === fcat;
    const d = new Date(e.date);
    const afterFrom = !from || d >= from;
    const beforeTo = !to || d <= to;
    return matchText && matchCat && afterFrom && beforeTo;
  }).sort((a,b) => new Date(b.date) - new Date(a.date));

  tbody.innerHTML = '';
  for (const e of filtered){
    const tr = document.createElement('tr');
    const catObj = categories.find(c => c.name === e.category) || {emoji:'❓'};
    tr.innerHTML = `
      <td>${e.date}</td>
      <td>${escapeHtml(e.desc)}</td>
      <td><span class="chip" title="${e.category}">${catObj.emoji}</span></td>
      <td class="amt">${inr.format(e.amount)}</td>
      <td class="actions">
        <button data-edit="${e.id}">Edit</button>
        <button data-del="${e.id}">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  }
  renderSummary();
}

function renderSummary(){
  const all = expenses.reduce((s,e) => s + Number(e.amount), 0);
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const monthTotal = expenses.reduce((s,e) => {
    const d = new Date(e.date);
    return s + (d.getFullYear()===y && d.getMonth()===m ? Number(e.amount):0);
  }, 0);
  totalAllEl.textContent = inr.format(all);
  totalMonthEl.textContent = inr.format(monthTotal);
  entriesCountEl.textContent = String(expenses.length);
}

// CRUD
function addExpense(data){
  expenses.push({ id: genId(), date: data.date, desc: data.desc, category: data.category, amount: Number(data.amount) });
  save(); render();
}
function updateExpense(id, data){
  const idx = expenses.findIndex
