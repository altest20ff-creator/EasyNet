export const deviceCatalog = [
  {
    id: 'router',
    label: 'راوتر',
    manufacturers: [
      {
        id: 'mikrotik',
        name: 'MikroTik',
        models: [
          {
            id: 'hap-ax2',
            name: 'hAP ax2',
            supported: {
              operationModes: ['Router', 'Bridge'],
              wan: true,
              lan: true,
              wifi: true,
              wifiBands: ['2.4 GHz', '5 GHz'],
              securityModes: ['WPA2-PSK', 'WPA3-SAE'],
              channels: ['Auto', '1', '6', '11', '36', '40'],
              txPowers: ['Low', 'Medium', 'High']
            }
          }
        ]
      },
      {
        id: 'tp-link',
        name: 'TP-Link',
        models: [
          {
            id: 'archer-ax55',
            name: 'Archer AX55',
            supported: {
              operationModes: ['Router', 'Access Point'],
              wan: true,
              lan: true,
              wifi: true,
              wifiBands: ['2.4 GHz', '5 GHz'],
              securityModes: ['WPA2-PSK', 'WPA3-SAE'],
              channels: ['Auto', '1', '6', '11', '36', '44'],
              txPowers: ['Low', 'Medium', 'High']
            }
          }
        ]
      }
    ]
  },
  {
    id: 'antenna',
    label: 'أنتينا',
    manufacturers: [
      {
        id: 'ubiquiti',
        name: 'Ubiquiti',
        models: [
          {
            id: 'nanostation-m5',
            name: 'NanoStation M5',
            supported: {
              operationModes: ['Bridge', 'Station'],
              wan: false,
              lan: true,
              wifi: true,
              wifiBands: ['5 GHz'],
              securityModes: ['WPA2-PSK'],
              channels: ['Auto', '36', '40', '44', '48'],
              txPowers: ['Low', 'Medium', 'High']
            }
          }
        ]
      }
    ]
  },
  {
    id: 'access-point',
    label: 'نقطة وصول',
    manufacturers: [
      {
        id: 'cisco',
        name: 'Cisco',
        models: [
          {
            id: 'catalyst-9115',
            name: 'Catalyst 9115',
            supported: {
              operationModes: ['Access Point', 'Mesh'],
              wan: false,
              lan: true,
              wifi: true,
              wifiBands: ['2.4 GHz', '5 GHz'],
              securityModes: ['WPA2-Enterprise', 'WPA3-Enterprise'],
              channels: ['Auto', '1', '6', '11', '36', '40', '44', '48'],
              txPowers: ['Low', 'Medium', 'High']
            }
          }
        ]
      }
    ]
  },
  {
    id: 'outdoor-device',
    label: 'جهاز خارجي',
    manufacturers: [
      {
        id: 'ruijie-reyee',
        name: 'Ruijie / Reyee',
        models: [
          {
            id: 'rg-rap6262-outdoor',
            name: 'RG-RAP6262 Outdoor',
            supported: {
              operationModes: ['Access Point', 'Mesh', 'Repeater'],
              wan: false,
              lan: true,
              wifi: true,
              wifiBands: ['2.4 GHz', '5 GHz'],
              securityModes: ['WPA2-PSK', 'WPA3-SAE'],
              channels: ['Auto', '1', '6', '11', '36', '40', '44', '48'],
              txPowers: ['Medium', 'High'],
              notes: ['يدعم العمل الخارجي بمعيار IP68']
            }
          }
        ]
      },
      {
        id: 'mikrotik-outdoor',
        name: 'MikroTik',
        models: [
          {
            id: 'netmetal-ac2',
            name: 'NetMetal ac2',
            supported: {
              operationModes: ['Bridge', 'Station'],
              wan: false,
              lan: true,
              wifi: true,
              wifiBands: ['2.4 GHz', '5 GHz'],
              securityModes: ['WPA2-PSK'],
              channels: ['Auto', '1', '6', '11', '36', '40'],
              txPowers: ['Low', 'Medium', 'High']
            }
          }
        ]
      }
    ]
  }
];

export const getDeviceTypes = () => deviceCatalog.map((type) => ({ id: type.id, label: type.label }));

export const getManufacturersForType = (typeId) => {
  const type = deviceCatalog.find((entry) => entry.id === typeId);
  return type?.manufacturers ?? [];
};

export const getModelsForManufacturer = (typeId, manufacturerId) => {
  const manufacturer = getManufacturersForType(typeId).find((item) => item.id === manufacturerId);
  return manufacturer?.models ?? [];
};

export const getModelById = (typeId, manufacturerId, modelId) =>
  getModelsForManufacturer(typeId, manufacturerId).find((model) => model.id === modelId) ?? null;
