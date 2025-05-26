// File: js/main.js

let cars = [];

// 初始化
document.addEventListener("DOMContentLoaded", () => {
  // 1. 加载车辆数据
  fetch("data/cars.json")
    .then(res => res.json())
    .then(data => {
      cars = data.cars;
      localStorage.setItem("carsData", JSON.stringify(data));
      initFilters(cars);
      renderCars(cars);
    })
    .catch(err => console.error("加载车辆数据失败", err));

  // 2. 填充时间下拉
  populateTimeSelectors();

  // 3. 搜索框相关监听
  const searchInput = document.getElementById("search-input");
  const suggestions = document.getElementById("suggestions");
  [searchInput].forEach(el => el.addEventListener("input", onSearchInput));
  document.addEventListener("click", e => {
    if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
      suggestions.hidden = true;
    }
  });

  // 4. 筛选下拉监听
  document.getElementById("brand-filter").addEventListener("change", applyFilters);
  document.getElementById("type-filter").addEventListener("change", applyFilters);
});

// 渲染车辆网格
function renderCars(list) {
  const container = document.getElementById("car-grid");
  container.innerHTML = "";
  list.forEach(car => {
    const card = document.createElement("div");
    card.className = "car-card";
    card.innerHTML = `
      <img src="${car.image}" alt="${car.brand} ${car.carModel}">
      <h3>${car.brand} ${car.carModel} (${car.yearOfManufacture})</h3>
      <p>${car.description}</p>
      <p><strong>Fuel:</strong> ${car.fuelType}</p>
      <p><strong>Price/Day:</strong> $${car.pricePerDay}</p>
      <button class="rent-btn" ${car.available ? "" : "disabled"} data-vin="${car.vin}">
        ${car.available ? "Rent" : "Unavailable"}
      </button>
    `;
    card.querySelector(".rent-btn").addEventListener("click", () => reserveCar(car));
    container.appendChild(card);
  });
}

// 初始化品牌/类型筛选
function initFilters(list) {
  const brandSel = document.getElementById("brand-filter");
  const typeSel  = document.getElementById("type-filter");
  [...new Set(list.map(c => c.brand))].sort().forEach(b => {
    const o = document.createElement("option"); o.value = b; o.textContent = b;
    brandSel.appendChild(o);
  });
  [...new Set(list.map(c => c.carType))].sort().forEach(t => {
    const o = document.createElement("option"); o.value = t; o.textContent = t;
    typeSel.appendChild(o);
  });
}

// 搜索输入处理
function onSearchInput(e) {
  const term = e.target.value.trim().toLowerCase();
  const sug = document.getElementById("suggestions");
  if (!term) { sug.hidden = true; return; }
  const matches = cars.filter(c => {
    const hay = (c.brand + " " + c.carModel + " " + c.description).toLowerCase();
    return hay.includes(term);
  }).slice(0,5);
  if (!matches.length) { sug.hidden = true; return; }
  sug.innerHTML = matches.map(c => `<li data-text="${c.brand} ${c.carModel}">${c.brand} ${c.carModel}</li>`).join("");
  sug.hidden = false;
  sug.querySelectorAll("li").forEach(li => li.addEventListener("click", e => {
    document.getElementById("search-input").value = e.target.dataset.text;
    sug.hidden = true;
    applyFilters();
  }));
}

// 综合过滤
function applyFilters() {
  const kw     = document.getElementById("search-input").value.trim().toLowerCase();
  const brand  = document.getElementById("brand-filter").value;
  const type   = document.getElementById("type-filter").value;
  const filtered = cars.filter(c => {
    if (brand && c.brand !== brand)       return false;
    if (type  && c.carType !== type)       return false;
    if (kw) {
      const hay = (c.brand+" "+c.carModel+" "+c.description).toLowerCase();
      if (!hay.includes(kw))                return false;
    }
    return true;
  });
  renderCars(filtered);
}

// 保留原有地点弹窗逻辑（示例）
const locations = ["Castle Hill (SYD)", "Artarmon Reserve Road (SYD)", "Chester Hill (SYD)", "Wolli Creek (SYD)", "Moorooka (BRIS)", "Oxley (BRIS)"];
function toggleLocationDropdown(type) {
  const dd    = document.getElementById(`${type}-dropdown`);
  const txt   = document.getElementById(`${type}-location-text`);
  const show  = dd.style.display !== 'block';
  document.querySelectorAll('.dropdown').forEach(d => d.style.display='none');
  if (!show) return;
  dd.innerHTML = '';
  locations.forEach(loc => {
    const li = document.createElement('li'); li.textContent = loc;
    li.onclick = e => { e.stopPropagation(); txt.textContent = loc; dd.style.display='none'; };
    dd.appendChild(li);
  });
  dd.style.display = 'block';
  setTimeout(() => document.addEventListener('click', ()=>dd.style.display='none'),0);
}

// 时间下拉填充
function populateTimeSelectors() {
  const opts = [];
  for (let h=8; h<=17; h++) for (let m of [0,30]) {
    if (h===17 && m===30) break;
    opts.push(`${String(h).padStart(2,'0')}:${m===0?'00':'30'}`);
  }
  ['pickup-time','dropoff-time'].forEach(id=>{
    const sel = document.getElementById(id);
    if (!sel) return;
    opts.forEach(t=>{ const o=document.createElement('option'); o.value=o.textContent=t; sel.appendChild(o); });
    sel.addEventListener('change',()=>validateTimeSelection(sel, id==='pickup-time'?'pickup-date':'dropoff-date'));
  });
}

// 预约并跳转
function reserveCar(car) {
  if (!car.available) return;
  localStorage.setItem('selectedVIN', car.vin);
  window.location.href = 'vehicle-detail.html';
}

// 验证时间
function validateTimeSelection(select, relatedDateId) {
  if (!document.getElementById(relatedDateId).value) {
    alert('Please select a date first.');
    select.value = '';
  }
}

// 日期最小值限制与联动
function setupDateConstraints() {
  const pick = document.getElementById('pickup-date');
  const drop = document.getElementById('dropoff-date');
  if (!pick||!drop) return;
  const today = new Date().toISOString().split('T')[0];
  pick.min = drop.min = today;
  pick.addEventListener('change', ()=>{
    drop.min = pick.value;
    if (drop.value < pick.value) drop.value='';
  });
}
// 在页面加载后调用
window.addEventListener('load', setupDateConstraints);
