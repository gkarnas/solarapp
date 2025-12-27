// =============================================================
// app/visits/[id].tsx  — TELA INDIVIDUAL DO CLIENTE EM VISITA
// =============================================================

import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Button,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import ProductsBlock from "../../components/ProductsBlock";
import { db } from "../../database/db";

// Helper total
const getTotal = (client: any) => {
  let total = 0;

  total += (client.inverterQty || 0) * (client.inverterUnit || 0);
  total += (client.panelsQty || 0) * (client.panelsUnit || 0);
  total += (client.batteryQty || 0) * (client.batteryUnit || 0);

  if (client.extras) {
    Object.values(client.extras).forEach((item: any) => {
      if (!item) return;
      const qty = Number(item.qty || 0);
      const unit = Number(item.unit || 0);
      total += qty * unit;
    });
  }

  return total;
};

export default function VisitDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPrices, setShowPrices] = useState(true);

  const [client, setClient] = useState<any>(null);

  // -----------------------------
  // Campos básicos
  // -----------------------------
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [phone, setPhone] = useState("");
  const [systemSize, setSystemSize] = useState("");
  const [email, setEmail] = useState("");

  // Visit extras
  const [visitDate, setVisitDate] = useState("");
  const [visitorName, setVisitorName] = useState("");

  // Products
  const [products, setProducts] = useState<any[]>([]);

  // System states
  const [inverterSelected, setInverterSelected] = useState("");
  const [inverterQty, setInverterQty] = useState("");
  const [inverterUnit, setInverterUnit] = useState("");
  const [inverterInfo, setInverterInfo] = useState("");

  const [panelsSelected, setPanelsSelected] = useState("");
  const [panelsQty, setPanelsQty] = useState("");
  const [panelsUnit, setPanelsUnit] = useState("");
  const [panelsInfo, setPanelsInfo] = useState("");

  const [batterySelected, setBatterySelected] = useState("");
  const [batteryQty, setBatteryQty] = useState("");
  const [batteryUnit, setBatteryUnit] = useState("");
  const [batteryInfo, setBatteryInfo] = useState("");

  // Extras
  const [extras, setExtras] = useState<any>({
    tiledRoof: { qty: "", unit: "", info: "" },
    cb: { qty: "", unit: "", info: "" },
    rcd: { qty: "", unit: "", info: "" },
    exportControl: { qty: "", unit: "", info: "" },
    neutralLink: { qty: "", unit: "", info: "" },
    acIsolator: { qty: "", unit: "", info: "" },
    isoLink: { qty: "", unit: "", info: "" },
    enclosure: { qty: "", unit: "", info: "" },
    hwTimer: { qty: "", unit: "", info: "" },
    dcRun: { qty: "", unit: "", info: "" },
    acRun: { qty: "", unit: "", info: "" },
    splitCircuit: { qty: "", unit: "", info: "" },
    other1: { qty: "", unit: "", info: "" },
    other2: { qty: "", unit: "", info: "" },
  });

  const load = async () => {
    setLoading(true);

    // Load products
    const snapP = await getDocs(collection(db, "products"));
    setProducts(snapP.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));

    // Load client
    const ref = doc(db, "clients", id as string);
    const data = await getDoc(ref);

    if (!data.exists()) return;

    const c = data.data() as any;
    setClient(c);

    setName(c.name || "");
    setDate(c.date || "");
    setNeighborhood(c.neighborhood || "");
    setPhone(c.phone ? String(c.phone) : "");
    setSystemSize(c.systemSize ? String(c.systemSize) : "");
    setEmail(c.email || "");

    setVisitDate(c.visitDate || "");
    setVisitorName(c.visitorName || "");

    setInverterSelected(c.inverterSelected || "");
    setInverterQty(c.inverterQty ? String(c.inverterQty) : "");
    setInverterUnit(c.inverterUnit ? String(c.inverterUnit) : "");
    setInverterInfo(c.inverterInfo || "");

    setPanelsSelected(c.panelsSelected || "");
    setPanelsQty(c.panelsQty ? String(c.panelsQty) : "");
    setPanelsUnit(c.panelsUnit ? String(c.panelsUnit) : "");
    setPanelsInfo(c.panelsInfo || "");

    setBatterySelected(c.batterySelected || "");
    setBatteryQty(c.batteryQty ? String(c.batteryQty) : "");
    setBatteryUnit(c.batteryUnit ? String(c.batteryUnit) : "");
    setBatteryInfo(c.batteryInfo || "");

    if (c.extras) setExtras(c.extras);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (newStage?: string) => {
    const ref = doc(db, "clients", id as string);

    await updateDoc(ref, {
      name,
      date,
      neighborhood,
      phone,
      email,
      systemSize,
      visitDate,
      visitorName,

      inverterSelected,
      inverterQty: Number(inverterQty || 0),
      inverterUnit: Number(inverterUnit || 0),
      inverterInfo,

      panelsSelected,
      panelsQty: Number(panelsQty || 0),
      panelsUnit: Number(panelsUnit || 0),
      panelsInfo,

      batterySelected,
      batteryQty: Number(batteryQty || 0),
      batteryUnit: Number(batteryUnit || 0),
      batteryInfo,

      extras,
      stage: newStage || "visit",
    });

    router.push("/visits");
  };

  const inverterList = products.filter((p) => p.item === "inverter");
  const panelList = products.filter((p) => p.item === "panel");
  const batteryList = products.filter((p) => p.item === "battery");

  const total = getTotal({
    inverterQty,
    inverterUnit,
    panelsQty,
    panelsUnit,
    batteryQty,
    batteryUnit,
    extras,
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 16 }}
    >
      {/* Header toggle */}
      <View
        style={{
          position: "absolute",
          top: 10,
          right: 16,
          zIndex: 20,
        }}
      >
        <Pressable onPress={() => setShowPrices(!showPrices)}>
          <Text style={{ fontSize: 26 }}>{showPrices ? "👁️‍🗨️" : "👁️"}</Text>
        </Pressable>
      </View>

      <Button title="Back to visits" onPress={() => router.push("/visits")} />

      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginTop: 20,
          textAlign: "center",
        }}
      >
        VISIT DETAILS
      </Text>

      {/* Campos Visit */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <TextInput
          value={visitDate}
          onChangeText={setVisitDate}
          placeholder="Visit date"
          style={{
            flex: 1,
            marginRight: 8,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 10,
          }}
        />

        <TextInput
          value={visitorName}
          onChangeText={setVisitorName}
          placeholder="Visitor name"
          style={{
            flex: 1,
            marginLeft: 8,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 10,
          }}
        />
      </View>

      {/* ProductsBlock */}
      <ProductsBlock
        showPrices={showPrices}
        inverterList={inverterList}
        panelList={panelList}
        batteryList={batteryList}
        inverterProps={{
          inverterSelected,
          setInverterSelected,
          inverterQty,
          setInverterQty,
          inverterUnit,
          setInverterUnit,
          inverterInfo,
          setInverterInfo,
        }}
        panelProps={{
          panelsSelected,
          setPanelsSelected,
          panelsQty,
          setPanelsQty,
          panelsUnit,
          setPanelsUnit,
          panelsInfo,
          setPanelsInfo,
        }}
        batteryProps={{
          batterySelected,
          setBatterySelected,
          batteryQty,
          setBatteryQty,
          batteryUnit,
          setBatteryUnit,
          batteryInfo,
          setBatteryInfo,
        }}
        extraProps={{
          ...extras,
          setExtras,
        }}
      />

      <Text style={{ fontSize: 22, fontWeight: "bold", marginVertical: 20 }}>
        Total: ${total}
      </Text>

      <Button title="Save" onPress={() => save()} />

      <View style={{ height: 10 }} />

      <Button
        title="Move: contract"
        color="#007AFF"
        onPress={() => save("contract")}
      />

      <View style={{ height: 10 }} />

      <Button
        title="Move: leads"
        color="orange"
        onPress={() => save("lead")}
      />

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
