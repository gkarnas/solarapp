// app/clients/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { db } from '../../database/db';

type ExtraState = {
  qty: string;
  unit: string;
  info: string;
};

const makeExtra = (): ExtraState => ({ qty: '', unit: '', info: '' });

export default function ClientEditScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const rawId = params.id;
  const clientId = Array.isArray(rawId) ? rawId[0] : (rawId as string);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showPrices, setShowPrices] = useState(false);

  // BASIC INFO
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [systemSize, setSystemSize] = useState('');

  // SYSTEM: inverter
  const [inverterQty, setInverterQty] = useState('');
  const [inverterSelected, setInverterSelected] = useState('');
  const [inverterUnit, setInverterUnit] = useState('');
  const [inverterInfo, setInverterInfo] = useState('');

  // SYSTEM: panels
  const [panelsQty, setPanelsQty] = useState('');
  const [panelsSelected, setPanelsSelected] = useState('');
  const [panelsUnit, setPanelsUnit] = useState('');
  const [panelsInfo, setPanelsInfo] = useState('');

  // SYSTEM: battery
  const [batteryQty, setBatteryQty] = useState('');
  const [batterySelected, setBatterySelected] = useState('');
  const [batteryUnit, setBatteryUnit] = useState('');
  const [batteryInfo, setBatteryInfo] = useState('');

  // EXTRAS (agora agrupados)
  const [tiledRoof, setTiledRoof] = useState<ExtraState>(makeExtra());
  const [cb, setCb] = useState<ExtraState>(makeExtra());
  const [rcd, setRcd] = useState<ExtraState>(makeExtra());
  const [expControl, setExpControl] = useState<ExtraState>(makeExtra());
  const [neutral, setNeutral] = useState<ExtraState>(makeExtra());
  const [acIso, setAcIso] = useState<ExtraState>(makeExtra());
  const [isoLink, setIsoLink] = useState<ExtraState>(makeExtra());
  const [enclosure, setEnclosure] = useState<ExtraState>(makeExtra());
  const [hwTimer, setHwTimer] = useState<ExtraState>(makeExtra());
  const [dcRun, setDcRun] = useState<ExtraState>(makeExtra());
  const [acRun, setAcRun] = useState<ExtraState>(makeExtra());
  const [splitCircuit, setSplitCircuit] = useState<ExtraState>(makeExtra());
  const [other1, setOther1] = useState<ExtraState>({ qty: '0', unit: '0', info: '' });
  const [other2, setOther2] = useState<ExtraState>({ qty: '0', unit: '0', info: '' });

  // NOTES
  const [extraServices, setExtraServices] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');

  const parse = (v: string) => {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  };

  const loadClient = async () => {
    if (!clientId) return;

    const snap = await getDoc(doc(db, 'clients', clientId));
    const d: any = snap.data() || {};

    setDate(d.date || '');
    setName(d.name || '');
    setAddress(d.address || '');
    setNeighborhood(d.neighborhood || '');
    setPhone(d.phone ? String(d.phone) : '');
    setEmail(d.email || '');
    setSystemSize(d.systemSize ? String(d.systemSize) : '');

    setInverterQty(d.inverterQty ? String(d.inverterQty) : '');
    setInverterSelected(d.inverterSelected || '');
    setInverterUnit(d.inverterUnit ? String(d.inverterUnit) : '');
    setInverterInfo(d.inverterInfo || '');

    setPanelsQty(d.panelsQty ? String(d.panelsQty) : '');
    setPanelsSelected(d.panelsSelected || '');
    setPanelsUnit(d.panelsUnit ? String(d.panelsUnit) : '');
    setPanelsInfo(d.panelsInfo || '');

    setBatteryQty(d.batteryQty ? String(d.batteryQty) : '');
    setBatterySelected(d.batterySelected || '');
    setBatteryUnit(d.batteryUnit ? String(d.batteryUnit) : '');
    setBatteryInfo(d.batteryInfo || '');

    const extras = d.extras || {};

    const safeExtra = (key: string, initial?: ExtraState): ExtraState => {
      const e = extras[key] || {};
      return {
        qty: e.qty != null ? String(e.qty) : initial?.qty ?? '',
        unit: e.unit != null ? String(e.unit) : initial?.unit ?? '',
        info: e.info || initial?.info || '',
      };
    };

    setTiledRoof(safeExtra('tiledRoof'));
    setCb(safeExtra('cb'));
    setRcd(safeExtra('rcd'));
    setExpControl(safeExtra('exportControl'));
    setNeutral(safeExtra('neutralLink'));
    setAcIso(safeExtra('acIsolator'));
    setIsoLink(safeExtra('isoLink'));
    setEnclosure(safeExtra('enclosure'));
    setHwTimer(safeExtra('hwTimer'));
    setDcRun(safeExtra('dcRun'));
    setAcRun(safeExtra('acRun'));
    setSplitCircuit(safeExtra('splitCircuit'));
    setOther1(safeExtra('other1', { qty: '0', unit: '0', info: '' }));
    setOther2(safeExtra('other2', { qty: '0', unit: '0', info: '' }));

    setExtraServices(d.extraServices || '');
    setVisitNotes(d.visitNotes || '');
    setServiceNotes(d.serviceNotes || '');

    setLoading(false);
  };

  useEffect(() => {
    loadClient();
  }, []);

  const saveClient = async () => {
    if (!clientId) return;
    setSaving(true);

    const payload: any = {
      date,
      name,
      address,
      neighborhood,
      phone: parse(phone),
      email,
      systemSize: parse(systemSize),

      inverterQty: parse(inverterQty),
      inverterSelected,
      inverterUnit: parse(inverterUnit),
      inverterInfo,

      panelsQty: parse(panelsQty),
      panelsSelected,
      panelsUnit: parse(panelsUnit),
      panelsInfo,

      batteryQty: parse(batteryQty),
      batterySelected,
      batteryUnit: parse(batteryUnit),
      batteryInfo,

      extras: {
        tiledRoof: {
          qty: parse(tiledRoof.qty),
          unit: parse(tiledRoof.unit),
          info: tiledRoof.info,
        },
        cb: {
          qty: parse(cb.qty),
          unit: parse(cb.unit),
          info: cb.info,
        },
        rcd: {
          qty: parse(rcd.qty),
          unit: parse(rcd.unit),
          info: rcd.info,
        },
        exportControl: {
          qty: parse(expControl.qty),
          unit: parse(expControl.unit),
          info: expControl.info,
        },
        neutralLink: {
          qty: parse(neutral.qty),
          unit: parse(neutral.unit),
          info: neutral.info,
        },
        acIsolator: {
          qty: parse(acIso.qty),
          unit: parse(acIso.unit),
          info: acIso.info,
        },
        isoLink: {
          qty: parse(isoLink.qty),
          unit: parse(isoLink.unit),
          info: isoLink.info,
        },
        enclosure: {
          qty: parse(enclosure.qty),
          unit: parse(enclosure.unit),
          info: enclosure.info,
        },
        hwTimer: {
          qty: parse(hwTimer.qty),
          unit: parse(hwTimer.unit),
          info: hwTimer.info,
        },
        dcRun: {
          qty: parse(dcRun.qty),
          unit: parse(dcRun.unit),
          info: dcRun.info,
        },
        acRun: {
          qty: parse(acRun.qty),
          unit: parse(acRun.unit),
          info: acRun.info,
        },
        splitCircuit: {
          qty: parse(splitCircuit.qty),
          unit: parse(splitCircuit.unit),
          info: splitCircuit.info,
        },
        other1: {
          qty: parse(other1.qty),
          unit: parse(other1.unit),
          info: other1.info,
        },
        other2: {
          qty: parse(other2.qty),
          unit: parse(other2.unit),
          info: other2.info,
        },
      },

      extraServices,
      visitNotes,
      serviceNotes,
    };

    await updateDoc(doc(db, 'clients', clientId), payload);

    setSaving(false);
    router.back();
  };

  const calcExtra = (x: ExtraState) => parse(x.qty) * parse(x.unit);

  const totalSystem =
    parse(inverterUnit) + parse(panelsUnit) + parse(batteryUnit);

  const totalExtras =
    calcExtra(tiledRoof) +
    calcExtra(cb) +
    calcExtra(rcd) +
    calcExtra(expControl) +
    calcExtra(neutral) +
    calcExtra(acIso) +
    calcExtra(isoLink) +
    calcExtra(enclosure) +
    calcExtra(hwTimer) +
    calcExtra(dcRun) +
    calcExtra(acRun) +
    calcExtra(splitCircuit) +
    calcExtra(other1) +
    calcExtra(other2);

  const FINAL_TOTAL = totalSystem + totalExtras;

  const renderSystemItem = (
    title: string,
    qty: string,
    setQty: any,
    selected: string,
    setSelected: any,
    unit: string,
    setUnit: any,
    info: string,
    setInfo: any
  ) => (
    <>
      <Text style={styles.sub}>{title}</Text>

      <Text style={styles.label}>Qty:</Text>
      <TextInput
        value={qty}
        onChangeText={setQty}
        style={styles.input}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Select:</Text>
      <TextInput
        value={selected}
        onChangeText={setSelected}
        style={styles.input}
      />

      {showPrices && (
        <>
          <Text style={styles.label}>Unit $:</Text>
          <TextInput
            value={unit}
            onChangeText={setUnit}
            style={styles.input}
            keyboardType="numeric"
          />
        </>
      )}

      <Text style={styles.label}>Info:</Text>
      <TextInput value={info} onChangeText={setInfo} style={styles.input} />

      <View style={styles.divider} />
    </>
  );

  const renderExtra = (title: string, item: ExtraState, setItem: any) => (
    <>
      <Text style={styles.sub}>{title}</Text>

      <Text style={styles.label}>Qty:</Text>
      <TextInput
        value={item.qty}
        onChangeText={(v) => setItem({ ...item, qty: v })}
        style={styles.input}
        keyboardType="numeric"
      />

      {showPrices && (
        <>
          <Text style={styles.label}>Price:</Text>
          <TextInput
            value={item.unit}
            onChangeText={(v) => setItem({ ...item, unit: v })}
            style={styles.input}
            keyboardType="numeric"
          />
        </>
      )}

      <Text style={styles.label}>Info:</Text>
      <TextInput
        value={item.info}
        onChangeText={(v) => setItem({ ...item, info: v })}
        style={styles.input}
      />

      <View style={styles.divider} />
    </>
  );

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* TOP BAR WITH EYE ICON */}
      <View style={styles.topBar}>
        <Pressable onPress={() => setShowPrices(!showPrices)}>
          <Text style={styles.eye}>{showPrices ? '👁️‍🗨️' : '👁️'}</Text>
        </Pressable>
      </View>

      <View style={{ padding: 16, paddingTop: 56 }}>
        <Text style={styles.title}>Edit client</Text>
        <Text style={{ marginBottom: 16, color: '#555' }}>ID: {clientId}</Text>

        {/* BASIC */}
        <Text>Date</Text>
        <TextInput value={date} onChangeText={setDate} style={styles.input} />

        <Text>Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <Text>Address</Text>
        <TextInput
          value={address}
          onChangeText={setAddress}
          style={styles.input}
        />

        <Text>Neighborhood</Text>
        <TextInput
          value={neighborhood}
          onChangeText={setNeighborhood}
          style={styles.input}
        />

        <Text>Phone</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          keyboardType="numeric"
        />

        <Text>Email</Text>
        <TextInput value={email} onChangeText={setEmail} style={styles.input} />

        <Text>System size (kW)</Text>
        <TextInput
          value={systemSize}
          onChangeText={setSystemSize}
          style={styles.input}
        />

        {/* SYSTEM */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>SYSTEM</Text>

          {renderSystemItem(
            'INVERTER',
            inverterQty,
            setInverterQty,
            inverterSelected,
            setInverterSelected,
            inverterUnit,
            setInverterUnit,
            inverterInfo,
            setInverterInfo
          )}

          {renderSystemItem(
            'PANELS',
            panelsQty,
            setPanelsQty,
            panelsSelected,
            setPanelsSelected,
            panelsUnit,
            setPanelsUnit,
            panelsInfo,
            setPanelsInfo
          )}

          {renderSystemItem(
            'BATTERY',
            batteryQty,
            setBatteryQty,
            batterySelected,
            setBatterySelected,
            batteryUnit,
            setBatteryUnit,
            batteryInfo,
            setBatteryInfo
          )}
        </View>

        {/* EXTRAS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>EXTRAS</Text>

          {renderExtra('Tiled roof', tiledRoof, setTiledRoof)}
          {renderExtra('CB', cb, setCb)}
          {renderExtra('RCD', rcd, setRcd)}
          {renderExtra('Export control', expControl, setExpControl)}
          {renderExtra('Neutral link', neutral, setNeutral)}
          {renderExtra('AC isolator', acIso, setAcIso)}
          {renderExtra('ISO link', isoLink, setIsoLink)}
          {renderExtra('Enclosure', enclosure, setEnclosure)}
          {renderExtra('HW timer', hwTimer, setHwTimer)}
          {renderExtra('DC run', dcRun, setDcRun)}
          {renderExtra('AC run', acRun, setAcRun)}
          {renderExtra('Split circuit', splitCircuit, setSplitCircuit)}
          {renderExtra('Other 1', other1, setOther1)}
          {renderExtra('Other 2', other2, setOther2)}
        </View>

        {/* NOTES */}
        <Text style={styles.section}>Extra services</Text>
        <TextInput
          value={extraServices}
          onChangeText={setExtraServices}
          style={styles.textarea}
          multiline
        />

        <Text style={styles.section}>Visit notes</Text>
        <TextInput
          value={visitNotes}
          onChangeText={setVisitNotes}
          style={styles.textarea}
          multiline
        />

        <Text style={styles.section}>Service notes</Text>
        <TextInput
          value={serviceNotes}
          onChangeText={setServiceNotes}
          style={styles.textarea}
          multiline
        />

        {/* TOTAL */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>${FINAL_TOTAL}</Text>
        </View>

        <Button title={saving ? 'Saving...' : 'Save'} onPress={saveClient} />
      </View>
    </ScrollView>
  );
}

const styles: any = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fafafa',
    marginBottom: 10,
  },
  label: {
    color: '#666',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  sub: {
    fontWeight: 'bold',
    marginTop: 12,
    color: '#444',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  section: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fafafa',
    minHeight: 80,
    marginBottom: 20,
  },
  topBar: {
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
  },
  eye: {
    fontSize: 28,
  },
  card: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  totalCard: {
    marginTop: 20,
    marginBottom: 40,
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  totalValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
});
