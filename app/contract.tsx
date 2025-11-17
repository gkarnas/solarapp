// app/contracts.tsx
import { useRouter } from 'expo-router';
import { doc, getDocs, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';

import { leadsCol } from '../database/db';

type ContractClient = {
  id: string;
  name: string;
  neighbourhood?: string;
  system_size?: number;
  stage?: string;
};

export default function ContractsScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<ContractClient[]>([]);
  const [loading, setLoading] = useState(false);

    const moveToVisit = async (leadId: string) => {
        try {
            const ref = doc(leadsCol.firestore, 'leads', leadId);
            await updateDoc(ref, { stage: 'visit' });
            await loadContracts();
        } catch (err) {
            console.error('Error moving client back to visit:', err);
        }
    };

    const moveToService = async (leadId: string) => {
        try {
            const ref = doc(leadsCol.firestore, 'leads', leadId);
            await updateDoc(ref, { stage: 'service' });
            await loadContracts();
        } catch (err) {
            console.error('Error moving client to service:', err);
        }
    };

  
  const loadContracts = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(leadsCol);
      const raw = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      }));

      const inContractStage = raw
        .filter(c => c.stage === 'contract')
        .map(c => ({
          id: c.id,
          name: c.name || 'No name',
          neighbourhood: c.neighbourhood,
          system_size: c.system_size,
          stage: c.stage,
        }));

      setClients(inContractStage);
    } catch (err) {
      console.error('Error loading contracts clients:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const updateStage = async (leadId: string, stage: string) => {
  try {
    const ref = doc(leadsCol, leadId);
    await updateDoc(ref, { stage });
    await loadContracts();
  } catch (err) {
    console.error('Error updating stage:', err);
  }
};

  useEffect(() => {
    loadContracts();
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
        Contracts – solarapp
      </Text>

      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <View style={{ marginRight: 8 }}>
            <Button
            title="VISIT"
            onPress={() => router.push('/visit')}
            />
        </View>
        <View>
            <Button
            title="SERVICE"
            onPress={() => router.push('/service')}
            />
        </View>
      </View>


      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        Clients in Contract stage:
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

            {/* AQUI entram os botões */}
            <View
                style={{
                flexDirection: 'row',
                marginTop: 8,
                }}
            >
                <View style={{ marginRight: 8 }}>
                <Button
                    title="Move: Visits"
                    onPress={() => updateStage(client.id, 'visit')}
                />
                </View>
                <View>
                <Button
                    title="Move: Service"
                    onPress={() => updateStage(client.id, 'service')}
                />
                </View>
            </View>
            </View>
        ))}


      {!loading && clients.length === 0 && (
        <Text>No clients in Contract stage yet.</Text>
      )}
    </ScrollView>
  );
}
