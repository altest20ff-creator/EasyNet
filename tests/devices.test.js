import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getDeviceTypes,
  getManufacturersForType,
  getModelsForManufacturer,
  getModelById
} from '../data/devices.js';

test('returns device types for selector', () => {
  const types = getDeviceTypes();
  assert.ok(types.length >= 4);
  assert.ok(types.some((type) => type.id === 'outdoor-device'));
});

test('contains Ruijie/Reyee RG-RAP6262 Outdoor demo model', () => {
  const models = getModelsForManufacturer('outdoor-device', 'ruijie-reyee');
  const model = models.find((entry) => entry.id === 'rg-rap6262-outdoor');

  assert.ok(model);
  assert.equal(model.name, 'RG-RAP6262 Outdoor');
  assert.deepEqual(model.supported.txPowers, ['Medium', 'High']);
});

test('retrieves specific model support matrix', () => {
  const model = getModelById('router', 'tp-link', 'archer-ax55');
  assert.ok(model);
  assert.equal(model.supported.wan, true);
  assert.ok(model.supported.securityModes.includes('WPA3-SAE'));

  const unknown = getManufacturersForType('unknown-type');
  assert.deepEqual(unknown, []);
});
