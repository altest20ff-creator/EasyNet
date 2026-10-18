import {
  getDeviceTypes,
  getManufacturersForType,
  getModelsForManufacturer,
  getModelById
} from './data/devices.js';

const startSetupButton = document.querySelector('#startSetup');
const deviceTypeSelect = document.querySelector('#deviceTypeSelect');
const manufacturerSelect = document.querySelector('#manufacturerSelect');
const modelSelect = document.querySelector('#modelSelect');
const selectionState = document.querySelector('#selectionState');
const wizardSection = document.querySelector('#wizardSection');
const wizardModelInfo = document.querySelector('#wizardModelInfo');
const progressBar = document.querySelector('#progressBar');
const stepLabel = document.querySelector('#stepLabel');
const wizardContent = document.querySelector('#wizardContent');
const formErrors = document.querySelector('#formErrors');
const prevStepButton = document.querySelector('#prevStep');
const nextStepButton = document.querySelector('#nextStep');
const themeToggle = document.querySelector('#themeToggle');

const state = {
  typeId: '',
  manufacturerId: '',
  modelId: '',
  model: null,
  step: 0,
  form: {
    deviceName: '',
    installLocation: '',
    operationMode: '',
    wanType: '',
    lanIp: '',
    ssid: '',
    wifiPassword: '',
    securityMode: '',
    channel: '',
    txPower: ''
  }
};

const wizardSteps = [
  { key: 'deviceInfo', label: 'معلومات الجهاز' },
  { key: 'operationMode', label: 'وضع التشغيل' },
  { key: 'wanLan', label: 'WAN / LAN' },
  { key: 'wifiSsid', label: 'Wi‑Fi / SSID' },
  { key: 'security', label: 'الأمان' },
  { key: 'channelPower', label: 'القناة وقوة الإرسال' },
  { key: 'review', label: 'المراجعة النهائية' }
];

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const fillSelect = (select, options, placeholder) => {
  select.innerHTML = '';
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = placeholder;
  select.append(defaultOption);

  options.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.label ?? item.name;
    select.append(option);
  });
};

const renderTypeOptions = () => {
  fillSelect(deviceTypeSelect, getDeviceTypes(), 'اختر نوع الجهاز');
};

const setStatus = (text) => {
  selectionState.textContent = text;
};

const getValidationErrors = () => {
  if (!state.model) {
    return ['اختر موديل الجهاز أولاً.'];
  }

  const errors = [];
  const { supported } = state.model;

  if (!state.form.deviceName.trim()) errors.push('اسم الجهاز مطلوب.');
  if (!state.form.installLocation.trim()) errors.push('موقع التركيب مطلوب.');
  if (!state.form.operationMode) errors.push('اختر وضع التشغيل.');

  if (supported.wan && !state.form.wanType) errors.push('اختر نوع اتصال WAN.');
  if (supported.lan && !state.form.lanIp.trim()) errors.push('أدخل عنوان LAN IP.');

  if (supported.wifi) {
    if (!state.form.ssid.trim()) errors.push('اسم شبكة Wi‑Fi (SSID) مطلوب.');
    if (!state.form.securityMode) errors.push('اختر نمط الأمان.');
    if (state.form.securityMode && !['Open', 'مفتوح'].includes(state.form.securityMode) && state.form.wifiPassword.length < 8) {
      errors.push('كلمة مرور Wi‑Fi يجب أن تكون 8 أحرف على الأقل.');
    }
    if (!state.form.channel) errors.push('اختر القناة.');
    if (!state.form.txPower) errors.push('اختر قوة الإرسال.');
  }

  return errors;
};

const renderError = (errors) => {
  if (!errors.length) {
    formErrors.classList.add('hidden');
    formErrors.textContent = '';
    return;
  }

  formErrors.classList.remove('hidden');
  formErrors.innerHTML = `<strong>يرجى تصحيح التالي:</strong><ul>${errors
    .map((error) => `<li>${error}</li>`)
    .join('')}</ul>`;
};

const optionsMarkup = (values) =>
  values.map((value) => `<option value="${value}">${value}</option>`).join('');

const renderWizardStep = () => {
  if (!state.model) return;

  const current = wizardSteps[state.step];
  const { supported } = state.model;
  stepLabel.textContent = `${state.step + 1} / ${wizardSteps.length} — ${current.label}`;
  progressBar.style.width = `${((state.step + 1) / wizardSteps.length) * 100}%`;
  prevStepButton.disabled = state.step === 0;
  nextStepButton.textContent = state.step === wizardSteps.length - 1 ? 'إنهاء' : 'التالي';

  if (current.key === 'deviceInfo') {
    wizardContent.innerHTML = `
      <label>اسم الجهاز
        <input name="deviceName" value="${escapeHtml(state.form.deviceName)}" placeholder="مثال: شبكة المنزل" />
      </label>
      <label>موقع التركيب
        <input name="installLocation" value="${escapeHtml(state.form.installLocation)}" placeholder="مثال: الدور الثاني" />
      </label>`;
  }

  if (current.key === 'operationMode') {
    wizardContent.innerHTML = `
      <label>وضع التشغيل
        <select name="operationMode">
          <option value="">اختر وضع التشغيل</option>
          ${optionsMarkup(supported.operationModes)}
        </select>
      </label>
      ${supported.notes?.length ? `<p class="status">${supported.notes.join(' — ')}</p>` : ''}`;
    wizardContent.querySelector('select').value = state.form.operationMode;
  }

  if (current.key === 'wanLan') {
    wizardContent.innerHTML = `
      ${
        supported.wan
          ? `<label>نوع اتصال WAN
              <select name="wanType">
                <option value="">اختر النوع</option>
                ${optionsMarkup(['DHCP', 'PPPoE', 'Static IP'])}
              </select>
            </label>`
          : ''
      }
      ${
        supported.lan
          ? `<label>عنوان LAN IP
              <input name="lanIp" value="${escapeHtml(state.form.lanIp)}" placeholder="192.168.1.1" />
            </label>`
          : ''
      }
      ${!supported.wan && !supported.lan ? '<p class="status">لا توجد إعدادات WAN/LAN لهذا الموديل.</p>' : ''}`;

    const wanSelect = wizardContent.querySelector('select[name="wanType"]');
    if (wanSelect) wanSelect.value = state.form.wanType;
  }

  if (current.key === 'wifiSsid') {
    wizardContent.innerHTML = supported.wifi
      ? `
      <label>اسم الشبكة (SSID)
        <input name="ssid" value="${escapeHtml(state.form.ssid)}" placeholder="EasyNet-WiFi" />
      </label>
      <label>نطاقات Wi‑Fi المدعومة
        <input value="${supported.wifiBands.join('، ')}" disabled />
      </label>`
      : '<p class="status">هذا الموديل لا يدعم Wi‑Fi.</p>';
  }

  if (current.key === 'security') {
    wizardContent.innerHTML = supported.wifi
      ? `
      <label>نمط الأمان
        <select name="securityMode">
          <option value="">اختر نمط الأمان</option>
          ${optionsMarkup(supported.securityModes)}
        </select>
      </label>
      <label>كلمة مرور Wi‑Fi
        <input name="wifiPassword" value="${escapeHtml(state.form.wifiPassword)}" type="password" placeholder="8 أحرف أو أكثر" />
      </label>
      <p class="status">تنبيه: لا تدخل كلمة مرور لوحة الإدارة هنا.</p>`
      : '<p class="status">خطوة الأمان غير مطلوبة بدون Wi‑Fi.</p>';

    const securitySelect = wizardContent.querySelector('select[name="securityMode"]');
    if (securitySelect) securitySelect.value = state.form.securityMode;
  }

  if (current.key === 'channelPower') {
    wizardContent.innerHTML = supported.wifi
      ? `
      <label>القناة
        <select name="channel">
          <option value="">اختر القناة</option>
          ${optionsMarkup(supported.channels)}
        </select>
      </label>
      <label>قوة الإرسال
        <select name="txPower">
          <option value="">اختر القوة</option>
          ${optionsMarkup(supported.txPowers)}
        </select>
      </label>`
      : '<p class="status">القناة وقوة الإرسال غير متاحتين لهذا الموديل.</p>';

    const channel = wizardContent.querySelector('select[name="channel"]');
    const txPower = wizardContent.querySelector('select[name="txPower"]');
    if (channel) channel.value = state.form.channel;
    if (txPower) txPower.value = state.form.txPower;
  }

  if (current.key === 'review') {
    const summary = {
      deviceType: deviceTypeSelect.selectedOptions[0]?.textContent ?? '',
      manufacturer: manufacturerSelect.selectedOptions[0]?.textContent ?? '',
      model: state.model.name,
      ...state.form
    };

    wizardContent.innerHTML = `
      <div class="summary">
        <pre id="summaryOutput"></pre>
      </div>
      <div class="wizard-actions">
        <button id="copyConfig" type="button" class="secondary">نسخ الملخص</button>
        <button id="downloadConfig" type="button" class="secondary">تنزيل JSON</button>
      </div>
      <p class="status">هذه النتيجة للنسخ أو التصدير فقط، ولا تُطبّق تلقائياً على الجهاز.</p>`;
    wizardContent.querySelector('#summaryOutput').textContent = JSON.stringify(summary, null, 2);

    wizardContent.querySelector('#copyConfig')?.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
        setStatus('تم نسخ الملخص.');
      } catch {
        setStatus('تعذّر النسخ التلقائي. يمكنك نسخ النص يدوياً من الملخص.');
      }
    });

    wizardContent.querySelector('#downloadConfig')?.addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${state.model.id}-config.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus('تم تجهيز ملف JSON للتنزيل.');
    });
  }

  Array.from(wizardContent.querySelectorAll('input, select')).forEach((element) => {
    const syncField = (event) => {
      state.form[event.target.name] = event.target.value;
    };
    element.addEventListener('input', syncField);
    element.addEventListener('change', syncField);
  });
};

const resetWizard = () => {
  state.step = 0;
  state.form = {
    deviceName: '',
    installLocation: '',
    operationMode: '',
    wanType: '',
    lanIp: '',
    ssid: '',
    wifiPassword: '',
    securityMode: '',
    channel: '',
    txPower: ''
  };
  renderError([]);
};

const handleTypeChange = () => {
  state.typeId = deviceTypeSelect.value;
  state.manufacturerId = '';
  state.modelId = '';
  state.model = null;

  const manufacturers = getManufacturersForType(state.typeId);
  fillSelect(manufacturerSelect, manufacturers, 'اختر الشركة');
  manufacturerSelect.disabled = !manufacturers.length;
  modelSelect.disabled = true;
  fillSelect(modelSelect, [], 'اختر الموديل');

  wizardSection.classList.add('hidden');

  if (!state.typeId) {
    setStatus('اختر نوع الجهاز للمتابعة.');
    return;
  }

  setStatus(manufacturers.length ? 'اختر الشركة المصنعة.' : 'لا توجد شركات متاحة لهذا النوع حالياً.');
};

const handleManufacturerChange = () => {
  state.manufacturerId = manufacturerSelect.value;
  state.modelId = '';
  state.model = null;
  modelSelect.disabled = true;
  fillSelect(modelSelect, [], 'جارٍ تحميل الموديلات...');
  wizardSection.classList.add('hidden');

  if (!state.manufacturerId) {
    fillSelect(modelSelect, [], 'اختر الموديل');
    setStatus('اختر الشركة المصنعة للمتابعة.');
    return;
  }

  setStatus('جارٍ تحميل الموديلات...');

  window.setTimeout(() => {
    const models = getModelsForManufacturer(state.typeId, state.manufacturerId);
    fillSelect(modelSelect, models, 'اختر الموديل');
    modelSelect.disabled = !models.length;
    setStatus(models.length ? 'اختر الموديل لفتح لوحة الإعدادات.' : 'لا توجد موديلات متاحة حالياً.');
  }, 300);
};

const handleModelChange = () => {
  state.modelId = modelSelect.value;
  state.model = getModelById(state.typeId, state.manufacturerId, state.modelId);

  if (!state.model) {
    wizardSection.classList.add('hidden');
    setStatus('اختر موديل صحيح للمتابعة.');
    return;
  }

  resetWizard();
  wizardSection.classList.remove('hidden');
  wizardModelInfo.textContent = `الموديل المختار: ${state.model.name}`;
  setStatus('تم فتح لوحة الإعدادات المخصصة للموديل.');
  renderWizardStep();
};

const handleStepNavigation = (direction) => {
  if (!state.model) return;

  if (direction > 0 && state.step === wizardSteps.length - 1) {
    const errors = getValidationErrors();
    renderError(errors);
    if (!errors.length) setStatus('اكتمل إعداد النموذج بنجاح. يمكنك نسخ أو تنزيل الملخص.');
    return;
  }

  if (direction > 0) {
    const errors = getValidationErrors();
    const currentErrors = errors.filter((error) => {
      const key = wizardSteps[state.step].key;
      if (key === 'deviceInfo') return /اسم الجهاز|موقع التركيب/.test(error);
      if (key === 'operationMode') return /وضع التشغيل/.test(error);
      if (key === 'wanLan') return /WAN|LAN/.test(error);
      if (key === 'wifiSsid') return /SSID/.test(error);
      if (key === 'security') return /الأمان|كلمة مرور/.test(error);
      if (key === 'channelPower') return /القناة|الإرسال/.test(error);
      return false;
    });

    renderError(currentErrors);
    if (currentErrors.length) return;
  }

  state.step = Math.max(0, Math.min(wizardSteps.length - 1, state.step + direction));
  renderError([]);
  renderWizardStep();
};

startSetupButton.addEventListener('click', () => {
  deviceTypeSelect.focus();
  setStatus('ابدأ باختيار نوع الجهاز.');
});

deviceTypeSelect.addEventListener('change', handleTypeChange);
manufacturerSelect.addEventListener('change', handleManufacturerChange);
modelSelect.addEventListener('change', handleModelChange);
prevStepButton.addEventListener('click', () => handleStepNavigation(-1));
nextStepButton.addEventListener('click', () => handleStepNavigation(1));
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

renderTypeOptions();
