// =============================================================
// index.tsx — PARTE 1/3
// =============================================================

import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ProductsBlock from '../components/ProductsBlock';
import { clientsCol, db } from '../database/db';



// =============================================================
// TYPES — CLIENTE, EXTRAS, PRODUTOS
// =============================================================

type ExtraItem = {
  qty?: number | null;
  unit?: number | null;
  info?: string;
};

type LeadClient = {
  id: string;
  note?: string;
  date?: string;
  name: string;
  address?: string;
  neighborhood?: string;
  phone?: number;
  email?: string;
  systemSize?: number | null;

  stage?: string;

  inverterQty?: number | null;
  inverterSelected?: string;
  inverterUnit?: number | null;
  inverterInfo?: string;

  panelsQty?: number | null;
  panelsSelected?: string;
  panelsUnit?: number | null;
  panelsInfo?: string;

  batteryQty?: number | null;
  batterySelected?: string;
  batteryUnit?: number | null;
  batteryInfo?: string;

  extras?: {
    tiledRoof?: ExtraItem;
    cb?: ExtraItem;
    rcd?: ExtraItem;
    exportControl?: ExtraItem;
    neutralLink?: ExtraItem;
    acIsolator?: ExtraItem;
    isoLink?: ExtraItem;
    enclosure?: ExtraItem;
    hwTimer?: ExtraItem;
    dcRun?: ExtraItem;
    acRun?: ExtraItem;
    splitCircuit?: ExtraItem;
    other1?: ExtraItem;
    other2?: ExtraItem;
  };

  extraServices?: string;
  visitNotes?: string;
  serviceNotes?: string;
};

type Product = {
  id: string;
  item: 'inverter' | 'panel' | 'battery';
  brand: string;
  model: string;
  capacity: number;
  price: number;
};

// =============================================================
// DEFAULTS + HELPERS
// =============================================================

const DEFAULT_PRICES = {
  tiledRoof: 300,
  cb: 50,
  rcd: 100,
  exportControl: 100,
  neutralLink: 75,
  acIsolator: 100,
  isoLink: 75,
  enclosure: 100,
  hwTimer: 200,
  dcRun: 20,
  acRun: 20,
  splitCircuit: 150,
};

const calcTotal = (qty: string, price: string) => {
  const q = Number(qty);
  const p = Number(price);
  if (!q || !p) return 0;
  return q * p;
};

const parseNumber = (val: any): number | null => {
  if (val === undefined || val === null || val === '') return null;
  const n = Number(String(val).trim());
  return isNaN(n) ? null : n;
};

// =============================================================
// COMPONENTE PRINCIPAL
// =============================================================

export default function ClientsScreen() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<LeadClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPrices, setShowPrices] = useState(true);

  // =============================================================
  // LOAD PRODUCTS
  // =============================================================
  useEffect(() => {
    const loadProducts = async () => {
      const snap = await getDocs(collection(db, 'products'));
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setProducts(items as Product[]);
    };
    loadProducts();
  }, []);

  const autoFillUnit = (list, selectedId, setUnit) => {
    const product = list.find(p => p.id === selectedId);
    if (product && product.price) {
      setUnit(String(product.price));
    }
  };

  const inverterList = products.filter((p) => p.item === 'inverter');
  const panelList = products.filter((p) => p.item === 'panel');
  const batteryList = products.filter((p) => p.item === 'battery');



  // =============================================================
  // LOAD CLIENTS
  // =============================================================
  const loadClients = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(clientsCol);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setClients(data.filter((c) => !c.stage || c.stage === 'lead'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const moveClientStage = async (clientId: string, newStage: string) => {
    try {
      const ref = doc(db, 'clients', clientId);
      await updateDoc(ref, { stage: newStage });
      await loadClients();
    } catch {}
  };

  // =============================================================
  // STATES BÁSICOS DO FORM
  // =============================================================

  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [systemSize, setSystemSize] = useState('');

  // =============================================================
  // STATES DO SYSTEM — INVERTER / PANELS / BATTERY
  // =============================================================

  // --- INVERTER ---
  const [inverterSelected, setInverterSelected] = useState('');
  const [inverterQty, setInverterQty] = useState('');
  const [inverterUnit, setInverterUnit] = useState('');
  const [inverterInfo, setInverterInfo] = useState('');

  // --- PANELS ---
  const [panelsSelected, setPanelsSelected] = useState('');
  const [panelsQty, setPanelsQty] = useState('');
  const [panelsUnit, setPanelsUnit] = useState('');
  const [panelsInfo, setPanelsInfo] = useState('');

  // --- BATTERY ---
  const [batterySelected, setBatterySelected] = useState('');
  const [batteryQty, setBatteryQty] = useState('');
  const [batteryUnit, setBatteryUnit] = useState('');
  const [batteryInfo, setBatteryInfo] = useState('');

  // =============================================================
  // STATES DOS EXTRAS
  // =============================================================

  const [tiledRoofQty, setTiledRoofQty] = useState('');
  const [tiledRoofUnit, setTiledRoofUnit] = useState(String(DEFAULT_PRICES.tiledRoof));
  const [tiledRoofInfo, setTiledRoofInfo] = useState('');

  const [cbQty, setCbQty] = useState('');
  const [cbUnit, setCbUnit] = useState(String(DEFAULT_PRICES.cb));
  const [cbInfo, setCbInfo] = useState('');

  const [rcdQty, setRcdQty] = useState('');
  const [rcdUnit, setRcdUnit] = useState(String(DEFAULT_PRICES.rcd));
  const [rcdInfo, setRcdInfo] = useState('');

  const [exportControlQty, setExportControlQty] = useState('');
  const [exportControlUnit, setExportControlUnit] = useState(String(DEFAULT_PRICES.exportControl));
  const [exportControlInfo, setExportControlInfo] = useState('');

  const [neutralLinkQty, setNeutralLinkQty] = useState('');
  const [neutralLinkUnit, setNeutralLinkUnit] = useState(String(DEFAULT_PRICES.neutralLink));
  const [neutralLinkInfo, setNeutralLinkInfo] = useState('');

  const [acIsolatorQty, setAcIsolatorQty] = useState('');
  const [acIsolatorUnit, setAcIsolatorUnit] = useState(String(DEFAULT_PRICES.acIsolator));
  const [acIsolatorInfo, setAcIsolatorInfo] = useState('');

  const [isoLinkQty, setIsoLinkQty] = useState('');
  const [isoLinkUnit, setIsoLinkUnit] = useState(String(DEFAULT_PRICES.isoLink));
  const [isoLinkInfo, setIsoLinkInfo] = useState('');

  const [enclosureQty, setEnclosureQty] = useState('');
  const [enclosureUnit, setEnclosureUnit] = useState(String(DEFAULT_PRICES.enclosure));
  const [enclosureInfo, setEnclosureInfo] = useState('');

  const [hwTimerQty, setHwTimerQty] = useState('');
  const [hwTimerUnit, setHwTimerUnit] = useState(String(DEFAULT_PRICES.hwTimer));
  const [hwTimerInfo, setHwTimerInfo] = useState('');

  const [dcRunQty, setDcRunQty] = useState('');
  const [dcRunUnit, setDcRunUnit] = useState(String(DEFAULT_PRICES.dcRun));
  const [dcRunInfo, setDcRunInfo] = useState('');

  const [acRunQty, setAcRunQty] = useState('');
  const [acRunUnit, setAcRunUnit] = useState(String(DEFAULT_PRICES.acRun));
  const [acRunInfo, setAcRunInfo] = useState('');

  const [splitCircuitQty, setSplitCircuitQty] = useState('');
  const [splitCircuitUnit, setSplitCircuitUnit] = useState(String(DEFAULT_PRICES.splitCircuit));
  const [splitCircuitInfo, setSplitCircuitInfo] = useState('');

  // TWO CUSTOM EXTRAS
  const [other1Qty, setOther1Qty] = useState('0');
  const [other1Unit, setOther1Unit] = useState('0');
  const [other1Info, setOther1Info] = useState('');

  const [other2Qty, setOther2Qty] = useState('0');
  const [other2Unit, setOther2Unit] = useState('0');
  const [other2Info, setOther2Info] = useState('');

  // FINAL TEXT FIELDS
  const [extraServices, setExtraServices] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');


  // =============================================================
  // RESET FORM — LIMPA TODOS OS CAMPOS
  // =============================================================

  const resetForm = () => {
    setDate('');
    setNote('');
    setName('');
    setAddress('');
    setNeighborhood('');
    setPhone('');
    setEmail('');
    setSystemSize('');

    setInverterSelected('');
    setInverterQty('');
    setInverterUnit('');
    setInverterInfo('');

    setPanelsSelected('');
    setPanelsQty('');
    setPanelsUnit('');
    setPanelsInfo('');

    setBatterySelected('');
    setBatteryQty('');
    setBatteryUnit('');
    setBatteryInfo('');

    setTiledRoofQty('');
    setTiledRoofUnit(String(DEFAULT_PRICES.tiledRoof));
    setTiledRoofInfo('');

    setCbQty('');
    setCbUnit(String(DEFAULT_PRICES.cb));
    setCbInfo('');

    setRcdQty('');
    setRcdUnit(String(DEFAULT_PRICES.rcd));
    setRcdInfo('');

    setExportControlQty('');
    setExportControlUnit(String(DEFAULT_PRICES.exportControl));
    setExportControlInfo('');

    setNeutralLinkQty('');
    setNeutralLinkUnit(String(DEFAULT_PRICES.neutralLink));
    setNeutralLinkInfo('');

    setAcIsolatorQty('');
    setAcIsolatorUnit(String(DEFAULT_PRICES.acIsolator));
    setAcIsolatorInfo('');

    setIsoLinkQty('');
    setIsoLinkUnit(String(DEFAULT_PRICES.isoLink));
    setIsoLinkInfo('');

    setEnclosureQty('');
    setEnclosureUnit(String(DEFAULT_PRICES.enclosure));
    setEnclosureInfo('');

    setHwTimerQty('');
    setHwTimerUnit(String(DEFAULT_PRICES.hwTimer));
    setHwTimerInfo('');

    setDcRunQty('');
    setDcRunUnit(String(DEFAULT_PRICES.dcRun));
    setDcRunInfo('');

    setAcRunQty('');
    setAcRunUnit(String(DEFAULT_PRICES.acRun));
    setAcRunInfo('');

    setSplitCircuitQty('');
    setSplitCircuitUnit(String(DEFAULT_PRICES.splitCircuit));
    setSplitCircuitInfo('');

    setOther1Qty('0');
    setOther1Unit('0');
    setOther1Info('');

    setOther2Qty('0');
    setOther2Unit('0');
    setOther2Info('');

    setExtraServices('');
    setVisitNotes('');
    setServiceNotes('');
  };


  // =============================================================
  // SAVE CLIENT — PAYLOAD COMPLETO CAMELCASE
  // =============================================================

  const saveClient = async () => {
    setErrorMsg(null);

    if (!name.trim() || !neighborhood.trim()) {
      setErrorMsg("Name and neighborhood are required.");
      return;
    }

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");

    const nameClean = name.replace(/\s+/g, "");
    const neighClean = neighborhood.replace(/\s+/g, "");
    const clientId = `${dd}${mm}${nameClean}${neighClean}`;

    try {
      const ref = doc(db, 'clients', clientId);
      const existing = await getDoc(ref);

      if (existing.exists()) {
        setErrorMsg("Client ID already exists. Change name or neighborhood.");
        return;
      }

      const payload: LeadClient = {
        id: clientId,
        date,
        name,
        note,
        address,
        neighborhood,
        phone: parseNumber(phone),
        email,
        systemSize: parseNumber(systemSize),

        inverterQty: parseNumber(inverterQty),
        inverterSelected,
        inverterUnit: parseNumber(inverterUnit),
        inverterInfo,

        panelsQty: parseNumber(panelsQty),
        panelsSelected,
        panelsUnit: parseNumber(panelsUnit),
        panelsInfo,

        batteryQty: parseNumber(batteryQty),
        batterySelected,
        batteryUnit: parseNumber(batteryUnit),
        batteryInfo,

        extras: {
          tiledRoof: { qty: parseNumber(tiledRoofQty), unit: parseNumber(tiledRoofUnit), info: tiledRoofInfo },
          cb: { qty: parseNumber(cbQty), unit: parseNumber(cbUnit), info: cbInfo },
          rcd: { qty: parseNumber(rcdQty), unit: parseNumber(rcdUnit), info: rcdInfo },
          exportControl: { qty: parseNumber(exportControlQty), unit: parseNumber(exportControlUnit), info: exportControlInfo },
          neutralLink: { qty: parseNumber(neutralLinkQty), unit: parseNumber(neutralLinkUnit), info: neutralLinkInfo },
          acIsolator: { qty: parseNumber(acIsolatorQty), unit: parseNumber(acIsolatorUnit), info: acIsolatorInfo },
          isoLink: { qty: parseNumber(isoLinkQty), unit: parseNumber(isoLinkUnit), info: isoLinkInfo },
          enclosure: { qty: parseNumber(enclosureQty), unit: parseNumber(enclosureUnit), info: enclosureInfo },
          hwTimer: { qty: parseNumber(hwTimerQty), unit: parseNumber(hwTimerUnit), info: hwTimerInfo },
          dcRun: { qty: parseNumber(dcRunQty), unit: parseNumber(dcRunUnit), info: dcRunInfo },
          acRun: { qty: parseNumber(acRunQty), unit: parseNumber(acRunUnit), info: acRunInfo },
          splitCircuit: { qty: parseNumber(splitCircuitQty), unit: parseNumber(splitCircuitUnit), info: splitCircuitInfo },
          other1: { qty: parseNumber(other1Qty), unit: parseNumber(other1Unit), info: other1Info },
          other2: { qty: parseNumber(other2Qty), unit: parseNumber(other2Unit), info: other2Info },
        },

        extraServices,
        visitNotes,
        serviceNotes,

        stage: 'lead',
        createdAt: new Date().toISOString(),
      };

      await setDoc(ref, payload);
      await loadClients();
      resetForm();
    } catch (err) {
      console.error(err);
      setErrorMsg("Error saving client.");
    }
  };
  // =============================================================
  // UI — TELA COMPLETA
  // =============================================================

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 60,
      }}
    >

      {/* HEADER — toggle preços */}
      <View
        style={{
          width: '100%',
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderColor: '#eee',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          backgroundColor: '#fff',
          position: 'absolute',
          top: 0,
          zIndex: 10,
        }}
      >
        <Pressable onPress={() => setShowPrices(!showPrices)}>
          <Text style={{ fontSize: 28 }}>
            {showPrices ? '👁️‍🗨️' : '👁️'}
          </Text>
        </Pressable>
      </View>

      {/* Títulos */}
      <Text
        style={{
          fontSize: 22,
          marginBottom: 16,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        LEADS
      </Text>

      <Text
        style={{
          fontSize: 22,
          marginBottom: 8,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        SOLARAPP – LEADS
      </Text>

      {/* BOTÕES DO TOPO */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Button title="PIPELINE" onPress={() => router.push('/pipeline')} />
        </View>

        <View style={{ flex: 1, marginRight: 8 }}>
          <Button title="VISIT" onPress={() => router.push('/visits')} />
        </View>
      </View>

      {/* CONTAGEM */}
      <Text style={{ marginBottom: 16 }}>Total clients: {clients.length}</Text>

      {errorMsg && (
        <Text style={{ color: 'red', marginBottom: 12 }}>{errorMsg}</Text>
      )}

      {/* LISTA DE CLIENTES */}
      <Text style={{ fontSize: 18, marginBottom: 8 }}>Registered leads:</Text>

      {loading && <Text>Loading...</Text>}

      {!loading &&
        clients.map((client) => (
          <View key={client.id} style={{ marginBottom: 10 }}>
            <TouchableOpacity
              onPress={() => router.push(`/clients/${client.id}`)}
            >
              <Text style={{ fontWeight: 'bold' }}>
                {(client.neighborhood || 'No neighbourhood') +
                  ' – ' +
                  client.id}
              </Text>

              <Text>Desired date: {client.date || '-'}</Text>

              <Text>
                System size:{' '}
                {client.systemSize != null ? `${client.systemSize} kW` : '-'}
              </Text>

              <Text>
                Phone:{' '}
                {client.phone != null && client.phone !== undefined
                  ? String(client.phone)
                  : '-'}
              </Text>

              <Text>{client.note || '-'}</Text>
            </TouchableOpacity>

            <View style={{ marginTop: 4 }}>
              <Button
                title="Move: visit"
                onPress={() => moveClientStage(client.id, 'visit')}
              />
            </View>
          </View>
        ))}

      {/* FORMULÁRIO — CAMPOS BÁSICOS */}
      <Text
        style={{
          marginTop: 24,
          fontSize: 18,
          marginBottom: 8,
        }}
      >
        Add new lead
      </Text>
<Text style={{ marginTop: 24, fontSize: 18, marginBottom: 8 }}>
  Add new lead
</Text>

{/* NOTE */}
<Text style={{ marginBottom: 4 }}>Note</Text>
<TextInput
  value={note}
  onChangeText={setNote}
  placeholder="Relevant info"
  placeholderTextColor="#A3A3A3"
  style={{
    backgroundColor: '#F6F6F7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  }}
/>

{/* DATE */}
<Text style={{ marginBottom: 4 }}>Desired installation date</Text>
<TextInput
  value={date}
  onChangeText={setDate}
  placeholder="25/11/2025"
  placeholderTextColor="#A3A3A3"
  style={{
    backgroundColor: '#F6F6F7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  }}
/>

{/* NAME */}
<Text style={{ marginBottom: 4 }}>Name</Text>
<TextInput
  value={name}
  onChangeText={setName}
  placeholder="Client name"
  placeholderTextColor="#A3A3A3"
  style={{
    backgroundColor: '#F6F6F7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  }}
/>

{/* ADDRESS */}
<Text style={{ marginBottom: 4 }}>Address</Text>
<TextInput
  value={address}
  onChangeText={setAddress}
  placeholder="Street, number..."
  placeholderTextColor="#A3A3A3"
  style={{
    backgroundColor: '#F6F6F7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  }}
/>

{/* NEIGHBORHOOD */}
<Text style={{ marginBottom: 4 }}>Neighborhood</Text>
<TextInput
  value={neighborhood}
  onChangeText={setNeighborhood}
  placeholder="Suburb / neighborhood"
  placeholderTextColor="#A3A3A3"
  style={{
    backgroundColor: '#F6F6F7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  }}
/>

{/* PHONE */}
<Text style={{ marginBottom: 4 }}>Phone</Text>
<TextInput
  value={phone}
  onChangeText={setPhone}
  placeholder="Only numbers"
  placeholderTextColor="#A3A3A3"
  keyboardType="numeric"
  style={{
    backgroundColor: '#F6F6F7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  }}
/>

{/* EMAIL */}
<Text style={{ marginBottom: 4 }}>Email</Text>
<TextInput
  value={email}
  onChangeText={setEmail}
  placeholder="email@example.com"
  placeholderTextColor="#A3A3A3"
  keyboardType="email-address"
  autoCapitalize="none"
  style={{
    backgroundColor: '#F6F6F7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  }}
/>

{/* SYSTEM SIZE */}
<Text style={{ marginBottom: 4 }}>System size (kW)</Text>
<TextInput
  value={systemSize}
  onChangeText={setSystemSize}
  placeholder="e.g. 6.6"
  placeholderTextColor="#A3A3A3"
  keyboardType="numeric"
  style={{
    backgroundColor: '#F6F6F7',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  }}
/>
{/* ========================================================= */}
{/* SYSTEM — INVERTER / PANELS / BATTERY */}
{/* ========================================================= */}
<ProductsBlock
  showPrices={showPrices}
  inverterList={inverterList}
  panelList={panelList}
  batteryList={batteryList}
  inverterProps={{
    inverterSelected, setInverterSelected,
    inverterQty, setInverterQty,
    inverterUnit, setInverterUnit,
    inverterInfo, setInverterInfo,
  }}
  panelProps={{
    panelsSelected, setPanelsSelected,
    panelsQty, setPanelsQty,
    panelsUnit, setPanelsUnit,
    panelsInfo, setPanelsInfo,
  }}
  batteryProps={{
    batterySelected, setBatterySelected,
    batteryQty, setBatteryQty,
    batteryUnit, setBatteryUnit,
    batteryInfo, setBatteryInfo,
  }}
  extraProps={{
    tiledRoof: { qty: tiledRoofQty, setQty: setTiledRoofQty, unit: tiledRoofUnit, setUnit: setTiledRoofUnit, info: tiledRoofInfo, setInfo: setTiledRoofInfo },
    cb: { qty: cbQty, setQty: setCbQty, unit: cbUnit, setUnit: setCbUnit, info: cbInfo, setInfo: setCbInfo },
    rcd: { qty: rcdQty, setQty: setRcdQty, unit: rcdUnit, setUnit: setRcdUnit, info: rcdInfo, setInfo: setRcdInfo },
    exportControl: { qty: exportControlQty, setQty: setExportControlQty, unit: exportControlUnit, setUnit: setExportControlUnit, info: exportControlInfo, setInfo: setExportControlInfo },
    neutralLink: { qty: neutralLinkQty, setQty: setNeutralLinkQty, unit: neutralLinkUnit, setUnit: setNeutralLinkUnit, info: neutralLinkInfo, setInfo: setNeutralLinkInfo },
    acIsolator: { qty: acIsolatorQty, setQty: setAcIsolatorQty, unit: acIsolatorUnit, setUnit: setAcIsolatorUnit, info: acIsolatorInfo, setInfo: setAcIsolatorInfo },
    isoLink: { qty: isoLinkQty, setQty: setIsoLinkQty, unit: isoLinkUnit, setUnit: setIsoLinkUnit, info: isoLinkInfo, setInfo: setIsoLinkInfo },
    enclosure: { qty: enclosureQty, setQty: setEnclosureQty, unit: enclosureUnit, setUnit: setEnclosureUnit, info: enclosureInfo, setInfo: setEnclosureInfo },
    hwTimer: { qty: hwTimerQty, setQty: setHwTimerQty, unit: hwTimerUnit, setUnit: setHwTimerUnit, info: hwTimerInfo, setInfo: setHwTimerInfo },
    dcRun: { qty: dcRunQty, setQty: setDcRunQty, unit: dcRunUnit, setUnit: setDcRunUnit, info: dcRunInfo, setInfo: setDcRunInfo },
    acRun: { qty: acRunQty, setQty: setAcRunQty, unit: acRunUnit, setUnit: setAcRunUnit, info: acRunInfo, setInfo: setAcRunInfo },
    splitCircuit: { qty: splitCircuitQty, setQty: setSplitCircuitQty, unit: splitCircuitUnit, setUnit: setSplitCircuitUnit, info: splitCircuitInfo, setInfo: setSplitCircuitInfo },
    other1: { qty: other1Qty, setQty: setOther1Qty, unit: other1Unit, setUnit: setOther1Unit, info: other1Info, setInfo: setOther1Info },
    other2: { qty: other2Qty, setQty: setOther2Qty, unit: other2Unit, setUnit: setOther2Unit, info: other2Info, setInfo: setOther2Info },
  }}
/>


      {/* ========================================================= */}
      {/* CAMPOS GRANDES — EXTRA SERVICES / VISIT NOTES / SERVICE NOTES */}
      {/* ========================================================= */}

      <Text style={{ fontWeight: 'bold' }}>Extra services / material</Text>
      <TextInput
        value={extraServices}
        onChangeText={setExtraServices}
        placeholder="Details of extra materials and services"
        multiline
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
          minHeight: 60,
          textAlignVertical: 'top',
        }}
      />

      <Text>Visit notes</Text>
      <TextInput
        value={visitNotes}
        onChangeText={setVisitNotes}
        placeholder="Notes you take during visit"
        multiline
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 8,
          minHeight: 60,
          textAlignVertical: 'top',
        }}
      />

      <Text>Service notes</Text>
      <TextInput
        value={serviceNotes}
        onChangeText={setServiceNotes}
        placeholder="Notes during / after service"
        multiline
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 8,
          marginBottom: 16,
          minHeight: 60,
          textAlignVertical: 'top',
        }}
      />

      {/* BOTÃO DE SALVAR */}
      <Button title="Save client" onPress={saveClient} />

      {/* IR PARA PRODUCTS */}
      <Button
        title="PRODUCTS"
        onPress={() => router.push('./products')}
      />

      <View style={{ height: 275 }} />
    </ScrollView>
  );};
