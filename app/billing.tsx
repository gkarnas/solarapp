// app/billing.tsx
import { useRouter } from 'expo-router';
import { doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { leadsCol } from '../database/db';


type BillingClient = {
  id: string;
  name: string;
  neighbourhood?: string;
  system_size?: number;
  stage?: string;
};

export default function BillingScreen() {
  const [clients, setClients] = useState<BillingClient[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  const loadBillingClients = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(leadsCol);
      const raw = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));

      const inBilling = raw
        .filter(c => c.stage === 'billing')
        .map(c => ({
          id: c.id,
          name: c.name || 'No name',
          neighbourhood: c.neighbourhood,
          system_size: c.system_size,
          stage: c.stage,
        }));

      setClients(inBilling);
    } catch (err) {
      console.error('Error loading billing clients:', err);
    } finally {
      setLoading(false);
    }
  };

    const updateStage = async (leadId: string, stage: string) => {
        try {
            const ref = doc(leadsCol, leadId);
            await updateDoc(ref, { stage });
            await loadBillingClients();
        } catch (err) {
            console.error('Error updating stage:', err);
        }
    };

  useEffect(() => {
    loadBillingClients();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 40,
      }}
    >
      <Text style={{ fontSize: 22, marginBottom: 16 }}>
        Billing – solarapp
      </Text>

        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <View style={{ marginRight: 8 }}>
                <Button
                title="SERVICE"
                onPress={() => router.push('/service')}
                />
            </View>
            <View>
                <Button
                title="AFTER-SALES"
                onPress={() => router.push('/afterSales')}
                />
            </View>
        </View>

      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        Clients in Billing stage:
      </Text>

      {loading && <Text>Loading...</Text>}

      {!loading &&
        clients.map(client => (
            <View key={client.id} style={{ marginBottom: 16 }}>
            <Text style={{ fontWeight: 'bold' }}>
                {client.name}
                {client.system_size ? ` – ${client.system_size} kW` : ''}
            </Text>
            {client.neighbourhood ? (
                <Text>{client.neighbourhood}</Text>
            ) : null}

            <View
                style={{
                flexDirection: 'row',
                marginTop: 8,
                }}
            >
                <View style={{ marginRight: 8 }}>
                <Button
                    title="Move Service"
                    onPress={() => updateStage(client.id, 'service')}
                />
                </View>
                <View>
                <Button
                    title="Move After-sales"
                    onPress={() => updateStage(client.id, 'after_sales')}
                />
                </View>
            </View>
            </View>
        ))}


      {!loading && clients.length === 0 && (
        <Text>No clients in Billing stage yet.</Text>
      )}
    </ScrollView>
  );
}
