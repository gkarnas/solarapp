// =============================================================
// app/visits.tsx  — LISTA DE CLIENTES EM STAGE "visit"
// =============================================================

import { useRouter } from "expo-router";
import { addDoc, collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { clientsCol, db } from "../database/db";

// Helper de total:
const getTotal = (client: any) => {
  let total = 0;

  // system
  total += (client.inverterQty || 0) * (client.inverterUnit || 0);
  total += (client.panelsQty || 0) * (client.panelsUnit || 0);
  total += (client.batteryQty || 0) * (client.batteryUnit || 0);

  // extras
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

export default function VisitsScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "clients"));
    const data = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    setClients(data.filter((c) => c.stage === "visit"));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  // Criar um cliente novo já no stage visit
  const createVisitClient = async () => {
    const ref = await addDoc(clientsCol, {
      name: "",
      neighborhood: "",
      phone: "",
      date: "",
      systemSize: null,
      visitDate: "",
      visitorName: "",
      stage: "visit",
      createdAt: new Date().toISOString(),
    });

    router.push(`/visits/${ref.id}`);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#fff" }}
      contentContainerStyle={{ paddingTop: 60, paddingHorizontal: 16 }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        VISITS
      </Text>

      <Text style={{ marginBottom: 16 }}>
        Total clients: {clients.length}
      </Text>

      {loading && <Text>Loading...</Text>}

      {!loading &&
        clients.map((c) => {
          const total = getTotal(c);

          return (
            <TouchableOpacity
              key={c.id}
              onPress={() => router.push(`/visits/${c.id}`)}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 10,
                padding: 12,
                marginBottom: 12,
                backgroundColor: "#fafafa",
              }}
            >
              {/* Linha 1: Name + Desired date */}
              <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                {c.name || "No name"} — {c.date || "-"}
              </Text>

              {/* Linha 2: Visit date + Visitor name */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text>Visit: {c.visitDate || "-"}</Text>
                <Text>By: {c.visitorName || "-"}</Text>
              </View>

              {/* Linha 3: System size + Total */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text>{c.systemSize ? `${c.systemSize} kW` : "-"}</Text>
                <Text>${total}</Text>
              </View>

              {/* Linha 4: Neighborhood + Phone */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>{c.neighborhood || "-"}</Text>
                <Text>{c.phone || "-"}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

      <View style={{ height: 40 }} />

      <Button title="New client" onPress={createVisitClient} />

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}
