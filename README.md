# De Kapotte AI — Debug Escape Room

Een interactieve escape room waar je als junior developer een kapot AI-systeem moet repareren door puzzels op te lossen.

## 🚀 Starten

### Optie 1: Direct in browser
Dubbelklik op `index.html` om de escape room direct te openen in je browser.

### Optie 2: Met lokale server
```bash
python3 -m http.server 8000
```
Open dan `http://localhost:8000` in je browser.

## 🧪 Tests

### Automatische Browser Tests
De tests draaien **automatisch** wanneer je de applicatie opstart. Open de browser console (F12) om de test resultaten te zien.

### Handmatig Tests Draaien (Jest)

1. **Installeer dependencies:**
```bash
npm install
```

2. **Draai alle tests:**
```bash
npm test
```

3. **Draai tests in watch mode:**
```bash
npm run test:watch
```

4. **Genereer coverage rapport:**
```bash
npm run test:coverage
```

## 📋 Test Coverage

De tests controleren:
- ✅ Game configuration (GAME object)
- ✅ State management
- ✅ Safe code validatie
- ✅ Code fix validatie logica
- ✅ Restart sequence validatie
- ✅ System config validatie
- ✅ Error code extractie

## 🎮 Spelen

1. Begin met **Error Logs** te bekijken
2. Repareer de code in de **Code Editor**
3. Open de safe met de juiste code
4. Analyseer de **Access Key**
5. Stel de **System Config** in
6. Voer de **Restart Sequence** uit

Veel succes! 🎯
