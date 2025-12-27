import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Button,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { clientsCol } from '../database/db';


type Client = {
  id: string;
  name: string;
  date?: string;
  neighborhood?: string;
  system_size?: number;
  stage?: string;
  battery_qty?: number;
  battery_info?: string;
  tiled_roof_qty?: number;
  tiled_roof_info?: string;
};

const STAGES = [
  { key: 'lead', label: 'LEADS' },
  { key: 'visit', label: 'VISIT' },
  { key: 'contract', label: 'CONTRACT' },
  { key: 'service', label: 'SERVICE' },
  { key: 'billing', label: 'BILLING' },
  { key: 'afterSales', label: 'AFTER SALES' },
];

function hasBattery(c: Client): boolean {
  return (
    (typeof c.battery_qty === 'number' && c.battery_qty > 0) ||
    (c.battery_info != null && c.battery_info.trim() !== '')
  );
}

function hasTiledRoof(c: Client): boolean {
  return (
    (typeof c.tiled_roof_qty === 'number' && c.tiled_roof_qty > 0) ||
    (c.tiled_roof_info != null &&
      c.tiled_roof_info.toLowerCase().includes('yes'))
  );
}

export default function PipelineScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    // trava em paisagem quando entra na tela
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );

    return () => {
      // volta pro normal (portrait) quando sair da tela
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    };
  }, []);


  const loadClients = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(clientsCol);
      const data: Client[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as any),
      }));
      setClients(data);
    } catch (err) {
      console.error('Error loading clients for pipeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const getClientsForStage = (stageKey: string) => {
    if (stageKey === 'lead') {
      // clientes antigos sem stage também contam como lead
      return clients.filter(
        c => !c.stage || c.stage === 'lead'
      );
    }
    return clients.filter(c => c.stage === stageKey);
  };

  const getFirstName = (fullName?: string) => {
    if (!fullName) return 'No name';
    return fullName.split(' ')[0];
  };

  return (
    <ScrollView
      horizontal
      style={{ flex: 1, backgroundColor: '#fff' }}
      contentContainerStyle={{
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 8,
      }}
    >
      {/* Título no topo (fixo na primeira coluna) */}
      <View
        style={{
            position: 'absolute',
            top: 16,
            left: 0,
            right: 0,
            alignItems: 'center',
        }}
        >
        <Text
            style={{
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 8,
            }}
        >
            SOLARAPP – PIPELINE
        </Text>
        {loading && <Text>Loading clients...</Text>}

        {/* NAV HORIZONTAL: LEADS / VISIT */}
        <View
            style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 8,
            width: '80%',
            }}
        >
            <View style={{ flex: 1, marginRight: 8 }}>
            <Button title="LEADS" onPress={() => router.push('/')} />
            </View>
            
        </View>
        </View>


      {/* Espaço pra não cobrir as colunas (título absoluto) */}
      <View style={{ height: 40 }} />

      {STAGES.map(stage => {
        const stageClients = getClientsForStage(stage.key);

        return (
          <View
            key={stage.key}
            style={{
              width: 260,
              marginHorizontal: 4,
              paddingHorizontal: 8,
            }}
          >
            {/* Nome da coluna */}
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                marginBottom: 8,
              }}
            >
              {stage.label}
            </Text>

            {stageClients.length === 0 ? (
              <Text
                style={{
                  textAlign: 'center',
                  color: '#999',
                  fontStyle: 'italic',
                  marginBottom: 8,
                }}
              >
                No clients
              </Text>
            ) : (
              stageClients.map(c => {
                const flagsText =
                  (hasBattery(c) ? 'bat ' : '') +
                  (hasTiledRoof(c) ? 'tile' : '');

                return (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() =>
                      router.push({
                        pathname: '/clients/[id]',
                        params: { id: c.id },
                      })
                    }
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 8,
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    {/* first name */}
                    <Text style={{ fontWeight: 'bold' }}>
                      {getFirstName(c.name)}{' '}
                      {/* neighborhood logo depois */}
                      {c.neighborhood
                        ? `– ${c.neighborhood}`
                        : ''}
                    </Text>

                    {/* desired installation date */}
                    <Text>
                      Date: {c.date || '-'}
                    </Text>

                    {/* system size */}
                    <Text>
                      Size:{' '}
                      {c.system_size != null
                        ? `${c.system_size} kW`
                        : '-'}
                    </Text>

                    {/* flags bat / tile */}
                    {flagsText ? (
                      <Text>{flagsText}</Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
