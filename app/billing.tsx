// app/billing.tsx
import { useRouter } from 'expo-router';
import { doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { clientsCol, db } from '../database/db';

type Client = {
  id: string;
  date?: string;
  name: string;
  neighborhood?: string;
  phone?: number;
  system_size?: number;
  stage?: string;
};

export default function BillingScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const loadClients = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(clientsCol);
      const data: Client[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));
      // só estágio "billing"
      setClients(data.filter(c => c.stage === 'billing'));
    } catch (err) {
      console.error('Error loading billing clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const moveClientStage = async (clientId: string, newStage: string) => {
    try {
      const ref = doc(db, 'clients', clientId);
      await updateDoc(ref, { stage: newStage });
      await loadClients();
    } catch (err) {
      console.error('Error moving client stage:', err);
    }
  };

  useEffect(() => {
    loadClients();
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
      <Text style={{ fontSize: 22, marginBottom: 16,  textAlign: 'center', fontWeight: 'bold', }}>
              BILLING
            </Text>

      {/* NAV: SERVICE / AFTER SALES */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          <Button title="SERVICE" onPress={() => router.push('/service')} />
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Button
            title="AFTER SALES"
            onPress={() => router.push('/afterSales')}
          />
        </View>
      </View>

      <Text style={{ fontSize: 18, marginBottom: 8 }}>
        Clients in Billing stage:
      </Text>

      {loading && <Text>Loading...</Text>}

      {!loading && clients.length === 0 && (
        <Text>No clients in Billing stage.</Text>
      )}

      {!loading &&
        clients.map(client => (
          <View key={client.id} style={{ marginBottom: 12 }}>
            {/* tap → edit client */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/clients/[id]',
                  params: { id: client.id },
                })
              }
            >
              {/* Linha 1: neighbourhood + id */}
              <Text style={{ fontWeight: 'bold' }}>
                {(client.neighborhood || 'No neighbourhood') +
                  ' – ' +
                  client.id}
              </Text>

              {/* Linha 2: desired date */}
              <Text>Desired date: {client.date || '-'}</Text>

              {/* Linha 3: system size */}
              <Text>
                System size:{' '}
                {client.system_size != null
                  ? `${client.system_size} kW`
                  : '-'}
              </Text>

              {/* Linha 4: phone */}
              <Text>
                Phone:{' '}
                {client.phone != null && client.phone !== undefined
                  ? String(client.phone)
                  : '-'}
              </Text>
            </TouchableOpacity>

            {/* BOTÕES DE STAGE: VOLTAR E AVANÇAR */}
            <View
              style={{
                flexDirection: 'row',
                marginTop: 4,
              }}
            >
              <View style={{ flex: 1, marginRight: 4 }}>
                <Button
                  title="Move: service"
                  onPress={() => moveClientStage(client.id, 'service')}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 4 }}>
                <Button
                  title="Move: afterSales"
                  onPress={() => moveClientStage(client.id, 'afterSales')}
                />
              </View>
            </View>
          </View>
        ))}
    </ScrollView>
  );
}
