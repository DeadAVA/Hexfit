import React, { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

type Sex = "M" | "F" | "X";

// Actualizamos los tipos para incluir los nuevos campos
export type AthleteData = {
  name: string;
  age: number;
  sex: Sex;
  height?: string;    // Guardamos como string para el input, convertimos al guardar si es necesario
  weight?: string;
  birthDate?: string; // Formato DD/MM/YYYY
};

type Props = {
  visible: boolean;
  title: string;
  initial?: Partial<AthleteData>; // Partial permite que falten datos al editar
  onClose: () => void;
  onSave: (data: AthleteData) => void;
};

export default function AthleteFormModal({
  visible,
  title,
  initial,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("20");
  const [sex, setSex] = useState<Sex>("X");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [birthDate, setBirthDate] = useState("");

  useEffect(() => {
    if (visible) {
      setName(initial?.name ?? "");
      setAge(String(initial?.age ?? 20));
      setSex(initial?.sex ?? "X");
      setHeight(initial?.height ?? "");
      setWeight(initial?.weight ?? "");
      setBirthDate(initial?.birthDate ?? "");
    }
  }, [initial, visible]);

  // Formatea la fecha con separadores automáticos
  const handleBirthDateChange = (text: string) => {
    // Remover todo excepto números
    let numbers = text.replace(/[^\d]/g, "");
    
    let formatted = "";
    
    // Validar día (01-31)
    if (numbers.length >= 2) {
      const day = parseInt(numbers.slice(0, 2), 10);
      if (day > 31) {
        numbers = numbers.slice(0, 1); // Mantener solo el primer dígito
      }
    }
    
    // Validar mes (01-12)
    if (numbers.length >= 4) {
      const month = parseInt(numbers.slice(2, 4), 10);
      if (month > 12) {
        numbers = numbers.slice(0, 3); // Mantener DD + primer dígito de mes
      }
    }
    
    // Agregar separadores automáticamente
    if (numbers.length <= 2) {
      formatted = numbers; // DD
    } else if (numbers.length <= 4) {
      formatted = numbers.slice(0, 2) + "/" + numbers.slice(2); // DD/MM
    } else {
      formatted = numbers.slice(0, 2) + "/" + numbers.slice(2, 4) + "/" + numbers.slice(4, 8); // DD/MM/YYYY
    }
    
    setBirthDate(formatted);
    validateAndCalcAge(formatted);
  };

  // Lógica para calcular edad automáticamente si la fecha es válida
  const validateAndCalcAge = (dateStr: string) => {
    // Formato simple DD/MM/YYYY
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateStr.match(regex);

    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      const currentYear = new Date().getFullYear();

      // Validación de rango de años (1900 - Año Actual Dinámico)
      if (year >= 1900 && year <= currentYear) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - year;
        const m = today.getMonth() + 1 - month;
        if (m < 0 || (m === 0 && today.getDate() < day)) {
          calculatedAge--;
        }
        // Actualizamos la edad automáticamente
        if (calculatedAge >= 0) {
          setAge(String(calculatedAge));
        }
      }
    }
  };

  const submit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return Alert.alert("Error", "Nombre requerido");

    const ageNum = Number(age);
    if (!Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120) {
      return Alert.alert("Error", "Edad inválida (0-120)");
    }

    // Validación final de fecha antes de guardar
    if (birthDate) {
      const parts = birthDate.split('/');
      if (parts.length === 3) {
        const year = parseInt(parts[2], 10);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
          return Alert.alert("Error", `El año de nacimiento debe estar entre 1900 y ${currentYear}`);
        }
      }
    }

    onSave({ 
      name: trimmedName, 
      age: ageNum, 
      sex,
      height,
      weight,
      birthDate
    });
  };

  const Chip = React.memo(({ value }: { value: Sex }) => {
    const active = sex === value;
    return (
      <Pressable
        onPress={() => setSex(value)}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: active ? "#00d4ff" : "#333",
          backgroundColor: active ? "#00d4ff" : "#1a1a1a",
          marginRight: 10,
        }}
      >
        <Text style={{ color: active ? "#000" : "#fff", fontWeight: "700" }}>
          {value}
        </Text>
      </Pressable>
    );
  });

  const InputLabel = React.memo(({ text }: { text: string }) => (
    <Text style={{ color: "#fff", fontWeight: "700", marginTop: 16, marginBottom: 8 }}>
      {text}
    </Text>
  ));

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={{ flex: 1, backgroundColor: "#0f0f0f", paddingTop: 40 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#333",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable onPress={onClose}>
            <Text style={{ color: "#999", fontSize: 16 }}>Cancelar</Text>
          </Pressable>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{title}</Text>
          <Pressable onPress={submit}>
            <Text style={{ color: "#00d4ff", fontSize: 16, fontWeight: "700" }}>Guardar</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <InputLabel text="Nombre" />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej: Alan"
            placeholderTextColor="#666"
            style={{
              backgroundColor: "#1a1a1a",
              color: "#fff",
              borderWidth: 1,
              borderColor: "#333",
              borderRadius: 10,
              padding: 12,
            }}
          />

          {/* Fila: Fecha Nacimiento y Edad */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 2 }}>
              <InputLabel text="F. Nacimiento (DD/MM/AAAA)" />
              <TextInput
                value={birthDate}
                onChangeText={handleBirthDateChange}
                placeholder="Ej: 25/12/1995"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={10}
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                  borderWidth: 1,
                  borderColor: "#333",
                  borderRadius: 10,
                  padding: 12,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputLabel text="Edad" />
              <TextInput
                value={age}
                onChangeText={setAge}
                placeholder="20"
                placeholderTextColor="#666"
                keyboardType="numeric"
                maxLength={3}
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                  borderWidth: 1,
                  borderColor: "#333",
                  borderRadius: 10,
                  padding: 12,
                }}
              />
            </View>
          </View>

          {/* Fila: Peso y Estatura */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <InputLabel text="Peso (kg)" />
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="Ej: 75.5"
                placeholderTextColor="#666"
                keyboardType="numeric"
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                  borderWidth: 1,
                  borderColor: "#333",
                  borderRadius: 10,
                  padding: 12,
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputLabel text="Estatura (cm)" />
              <TextInput
                value={height}
                onChangeText={setHeight}
                placeholder="Ej: 178"
                placeholderTextColor="#666"
                keyboardType="numeric"
                style={{
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                  borderWidth: 1,
                  borderColor: "#333",
                  borderRadius: 10,
                  padding: 12,
                }}
              />
            </View>
          </View>

          <InputLabel text="Sexo" />
          <View style={{ flexDirection: "row" }}>
            <Chip value="M" />
            <Chip value="F" />
            <Chip value="X" />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}