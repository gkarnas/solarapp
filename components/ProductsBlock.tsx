// =============================================================
// components/ProductsBlock.tsx
// =============================================================
import { Picker } from "@react-native-picker/picker";
import { Text, TextInput, View } from "react-native";

export default function ProductsBlock(props: any) {
  const {
    showPrices,
    inverterList,
    panelList,
    batteryList,
    inverterProps,
    panelProps,
    batteryProps,
    extraProps,
  } = props;

  // =====================================================
  // auto-fill price when selecting a product
  // =====================================================
  const autoFillUnit = (list, selectedId, setUnit) => {
    const product = list.find((p) => p.id === selectedId);
    if (product && product.price) {
      setUnit(String(product.price));
    }
  };

  // =====================================================
  // Extract system props
  // =====================================================
  const {
    inverterSelected,
    setInverterSelected,
    inverterQty,
    setInverterQty,
    inverterUnit,
    setInverterUnit,
    inverterInfo,
    setInverterInfo,
  } = inverterProps;

  const {
    panelsSelected,
    setPanelsSelected,
    panelsQty,
    setPanelsQty,
    panelsUnit,
    setPanelsUnit,
    panelsInfo,
    setPanelsInfo,
  } = panelProps;

  const {
    batterySelected,
    setBatterySelected,
    batteryQty,
    setBatteryQty,
    batteryUnit,
    setBatteryUnit,
    batteryInfo,
    setBatteryInfo,
  } = batteryProps;

  const extras = extraProps;

  // =====================================================
  // calc total
  // =====================================================
  const calc = (q, p) => {
    const x = Number(q);
    const y = Number(p);
    return !x || !y ? 0 : x * y;
  };

  // =====================================================
  // EXTRA FIELD COMPONENT
  // =====================================================
  const ExtraField = ({
    label,
    qty,
    setQty,
    unit,
    setUnit,
    info,
    setInfo,
  }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontWeight: "bold" }}>{label}</Text>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
        {/* QTY */}
        <TextInput
          value={qty}
          onChangeText={setQty}
          placeholder="Qty"
          keyboardType="numeric"
          style={{
            flex: 1,
            backgroundColor: "#F6F6F7",
            borderRadius: 10,
            padding: 12,
            borderWidth: 1,
            borderColor: "#E5E5EA",
          }}
          placeholderTextColor="#A3A3A3"
        />

        {/* UNIT PRICE with $ */}
        {showPrices && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flex: 1,
              backgroundColor: "#F6F6F7",
              borderRadius: 10,
              borderWidth: 1,
              borderColor: "#E5E5EA",
              paddingLeft: 8,
            }}
          >
            <Text style={{ marginRight: 4 }}>$</Text>

            <TextInput
              value={unit}
              onChangeText={setUnit}
              keyboardType="numeric"
              style={{
                flex: 1,
                padding: 12,
              }}
              placeholder="Unit"
              placeholderTextColor="#A3A3A3"
            />
          </View>
        )}

        {/* TOTAL */}
        <View
          style={{
            flex: 1,
            borderWidth: 1,
            padding: 8,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f2f2f2",
          }}
        >
          {showPrices ? (
            <Text>${calc(qty, unit)}</Text>
          ) : (
            <Text style={{ color: "#999" }}>—</Text>
          )}
        </View>
      </View>

      {/* NOTES */}
      <TextInput
        value={info}
        onChangeText={setInfo}
        placeholder="Notes"
        style={{
          backgroundColor: "#F6F6F7",
          borderRadius: 10,
          padding: 12,
          borderWidth: 1,
          borderColor: "#E5E5EA",
        }}
        placeholderTextColor="#A3A3A3"
      />
    </View>
  );

  // =====================================================
  // RENDER SYSTEM INPUT GROUP (AGORA COM SELECTED)
  // =====================================================
  const renderSystemBlock = ({
    title,
    qty,
    setQty,
    selected,
    setSelected,
    unit,
    setUnit,
    info,
    setInfo,
    list,
  }) => {
    const selectedItem = list.find((p) => p.id === selected);

    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontWeight: "600", fontSize: 16, marginBottom: 6 }}>
          {title}
        </Text>

        {/* SHOW SELECTED INFORMATION */}
        {selectedItem && (
          <Text
            style={{
              marginBottom: 6,
              color: "#444",
              fontSize: 13,
              fontWeight: "500",
            }}
          >
            Selected: {selectedItem.brand} {selectedItem.model} (
            {selectedItem.capacity})
          </Text>
        )}

        {/* QTY + PICKER */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput
            value={qty}
            onChangeText={setQty}
            placeholder="Qty"
            keyboardType="numeric"
            placeholderTextColor="#A3A3A3"
            style={{
              flex: 1,
              backgroundColor: "#F6F6F7",
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: "#E5E5EA",
            }}
          />

          <View style={{ flex: 2 }}>
            <View
              style={{
                backgroundColor: "#F6F6F7",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#E5E5EA",
                overflow: "hidden",
              }}
            >
              <Picker
                selectedValue={selected}
                onValueChange={(v) => {
                  setSelected(v);
                  autoFillUnit(list, v, setUnit);
                }}
              >
                <Picker.Item label={`Choose ${title.toLowerCase()}`} value="" />
                {list.map((p) => (
                  <Picker.Item
                    key={p.id}
                    label={`${p.brand} ${p.model} (${p.capacity})`}
                    value={p.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* PRICE + NOTES */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          {showPrices && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                backgroundColor: "#F6F6F7",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#E5E5EA",
                paddingLeft: 8,
              }}
            >
              <Text style={{ marginRight: 4 }}>$</Text>

              <TextInput
                value={unit}
                onChangeText={setUnit}
                placeholder="Unit"
                keyboardType="numeric"
                placeholderTextColor="#A3A3A3"
                style={{
                  flex: 1,
                  padding: 12,
                }}
              />
            </View>
          )}

          <TextInput
            value={info}
            onChangeText={setInfo}
            placeholder="Notes"
            placeholderTextColor="#A3A3A3"
            style={{
              flex: 2,
              backgroundColor: "#F6F6F7",
              borderRadius: 10,
              padding: 12,
              borderWidth: 1,
              borderColor: "#E5E5EA",
            }}
          />
        </View>
      </View>
    );
  };

  // =====================================================
  // MAIN RENDER
  // =====================================================
  return (
    <View style={{ marginVertical: 24 }}>
      {/* SYSTEM BLOCKS */}
      {renderSystemBlock({
        title: "Inverter",
        qty: inverterQty,
        setQty: setInverterQty,
        selected: inverterSelected,
        setSelected: setInverterSelected,
        unit: inverterUnit,
        setUnit: setInverterUnit,
        info: inverterInfo,
        setInfo: setInverterInfo,
        list: inverterList,
      })}

      {renderSystemBlock({
        title: "Panels",
        qty: panelsQty,
        setQty: setPanelsQty,
        selected: panelsSelected,
        setSelected: setPanelsSelected,
        unit: panelsUnit,
        setUnit: setPanelsUnit,
        info: panelsInfo,
        setInfo: setPanelsInfo,
        list: panelList,
      })}

      {renderSystemBlock({
        title: "Battery",
        qty: batteryQty,
        setQty: setBatteryQty,
        selected: batterySelected,
        setSelected: setBatterySelected,
        unit: batteryUnit,
        setUnit: setBatteryUnit,
        info: batteryInfo,
        setInfo: setBatteryInfo,
        list: batteryList,
      })}

      {/* EXTRAS */}
      {Object.entries(extras).map(([key, item]) => (
        <ExtraField
          key={key}
          label={key}
          qty={item.qty}
          setQty={item.setQty}
          unit={item.unit}
          setUnit={item.setUnit}
          info={item.info}
          setInfo={item.setInfo}
        />
      ))}
    </View>
  );
}
