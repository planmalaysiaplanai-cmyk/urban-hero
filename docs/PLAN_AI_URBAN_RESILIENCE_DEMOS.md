# PLAN AI Urban Resilience Lab

## Full Demo Scenario Specification

Dokumen ini menerangkan satu siri demo interaktif yang menunjukkan bagaimana PLAN AI memahami objektif, menilai risiko, membina pelan, melaksanakan tindakan, dan melakukan re-plan apabila keadaan bandar berubah.

Nama produk sementara:

**PLAN AI Urban Resilience Lab**

Tagline:

> Observe. Plan. Simulate. Adapt.

## 1. Matlamat Showcase

Showcase ini bukan permainan bencana biasa dan bukan chatbot yang diletakkan di sebelah visual 3D. Dunia 3D ialah representasi langsung kepada keadaan yang sedang difahami oleh AI.

Setiap demo perlu menunjukkan lima keupayaan utama:

1. **Observe** - PLAN AI membaca keadaan bandar dan mengenal pasti risiko.
2. **Prioritize** - PLAN AI menentukan aset, komuniti, dan objektif yang paling kritikal.
3. **Plan** - PLAN AI menghasilkan urutan tindakan yang boleh diperiksa.
4. **Execute** - Setiap langkah pelan berlaku dalam simulasi 3D.
5. **Adapt** - PLAN AI membina semula pelan apabila data atau keadaan berubah.

## 2. Struktur Bersama Semua Demo

Semua misi menggunakan struktur pengalaman yang sama supaya pengguna cepat memahami produk walaupun ancaman berubah.

### Fasa A: Situation Briefing

Kamera memperkenalkan bandar, ancaman, aset kritikal, dan masa yang tersedia. Maklumat penting dipaparkan sebagai overlay yang ringkas.

### Fasa B: Define Mission

Pengguna memilih objektif utama, menetapkan constraints, atau menggunakan arahan bahasa semula jadi.

### Fasa C: PLAN AI Analysis

PLAN AI mengimbas bandar, membina dependency map, membandingkan strategi, dan menerangkan strategi yang dipilih.

### Fasa D: Execute Simulation

Pelan dilaksanakan langkah demi langkah. Kamera, timeline, dan panel penjelasan bergerak serentak dengan tindakan di dunia 3D.

### Fasa E: Disruption

Satu kejadian baharu mengubah risiko atau menjadikan sebahagian pelan asal tidak lagi sesuai.

### Fasa F: Re-plan

PLAN AI menghentikan atau memperlahankan simulasi, menilai impak, dan mengubah urutan tindakan.

### Fasa G: Mission Report

Sistem membandingkan sasaran, hasil sebenar, kos, trade-off, dan keputusan yang mungkin berlaku tanpa adaptasi.

## 3. Sistem Bandar Bersama

Bandar menggunakan beberapa lapisan yang boleh dihidupkan atau disembunyikan:

- Population and vulnerability
- Energy network
- Water and drainage network
- Roads and public transport
- Hospitals and emergency services
- Communications network
- Environmental conditions
- Critical supply routes
- Economic and operational impact

Panel kanan memaparkan **AI Plan**, panel kiri memaparkan **Mission Control**, bahagian bawah memaparkan **Execution Timeline**, dan dunia 3D kekal sebagai fokus utama.

---

# Mission 01: The Frozen Storm

## 1. Mission Identity

**Tema:** Ribut ais dan kegagalan tenaga  
**Fokus bandar:** Hospital, grid elektrik, laluan pemindahan, pusat perlindungan  
**Keupayaan AI:** Spatial forecasting, sequencing, dan live re-planning

## 2. Situation

Sebuah cryogenic supercell sedang bergerak menuju pusat bandar. Suhu turun secara mendadak, jalan mula membeku, dan permintaan tenaga meningkat. Hospital utama masih beroperasi tetapi pencawang timur menunjukkan tanda overload.

Countdown impak bermula pada 04:32.

Paparan pembukaan:

```text
CRITICAL EVENT DETECTED
Cryogenic Supercell
Impact Estimate: 04:32
Threat Level: Severe
```

## 3. City Elements

- Central hospital
- Eastern power station
- Residential Sector C
- Two evacuation corridors
- Emergency shelters
- Frozen road network
- Storm trajectory field
- City battery reserve

## 4. User Mission

Arahan utama:

> Protect the city, restore critical power, and evacuate civilians with minimum damage.

Constraints pilihan:

- Do not allow the hospital to lose power.
- Keep Route Alpha operational.
- Use less than 60% of emergency energy.
- Prioritize civilian safety over property damage.

## 5. Data Read by PLAN AI

- Ribut: arah, kelajuan, suhu, radius impak
- Jalan: status ais, kapasiti, masa perjalanan
- Populasi: lokasi, jumlah, vulnerability index
- Tenaga: demand, reserve, transformer load
- Aset kritikal: hospital, shelter, pencawang
- Ability: Ice Wall, Lightning Relay, Scan Pulse

## 6. Initial AI Plan

```text
01 - Analyze storm trajectory
02 - Establish an ice barrier at Sector C
03 - Redirect civilians through Route Bravo
04 - Restore the eastern power grid
05 - Protect the hospital energy corridor
06 - Contain secondary electrical hazards
07 - Monitor storm movement and adapt
```

Strategi dipaparkan sebagai:

```text
Selected Strategy: Controlled Containment
Estimated Success: 87%
Projected Energy Use: 54%
Primary Priority: Civilian Safety
```

## 7. Simulation Sequence

### Step 1: Analyze

Scan Pulse bergerak merentasi bandar. Zon merah menunjukkan jangkaan impak, manakala garis putus-putus menunjukkan uncertainty band.

### Step 2: Contain

Ice Wall dibina di Sector C untuk mengubah arah aliran sejuk dan melindungi hospital.

### Step 3: Evacuate

Route Bravo menyala. Unit awam bergerak secara berperingkat untuk mengelakkan kesesakan.

### Step 4: Restore Power

Lightning Relay menyambungkan semula pencawang timur kepada microgrid hospital.

### Step 5: Stabilize

PLAN AI mengehadkan beban bangunan bukan kritikal dan memantau transformer.

## 8. Disruption Event

Angin berubah arah secara tiba-tiba. Ice Wall asal tidak lagi melindungi keseluruhan Sector C dan Route Alpha akan membeku dalam 45 saat.

```text
UNEXPECTED WIND SHIFT
Plan viability: 61%
Route Alpha closure estimate: 00:45
Re-planning required
```

## 9. Re-plan

PLAN AI melakukan perubahan berikut:

```text
PAUSE      Route Alpha evacuation
EXTEND     Ice Wall toward Sector B
OPEN       Route Bravo emergency lanes
TRANSFER   12% grid power to road heating
DELAY      Commercial district restoration
```

Panel penjelasan menerangkan bahawa kerosakan komersial diterima untuk melindungi hospital dan mempercepat pemindahan.

## 10. Mission Report

```text
MISSION COMPLETE

Civilians protected       94%
Critical facilities       5 / 6
Infrastructure damage     12%
Energy consumed           57%
Plan adaptations          2
Recovery estimate         18 hours
```

Perbandingan akhir menunjukkan hasil pelan asal, pelan adaptif, dan anggaran hasil tanpa re-plan.

---

# Mission 02: Operation Rising Tide

## 1. Mission Identity

**Tema:** Banjir bandar dan air pasang besar  
**Fokus bandar:** Sungai, saliran, metro, pam air, hospital, perumahan rendah  
**Keupayaan AI:** Flood forecasting, resource allocation, dan infrastructure trade-offs

## 2. Situation

Hujan luar biasa telah berterusan selama 14 jam. Paras sungai meningkat, air pasang dijangka mencapai puncak dalam enam minit, dan sistem saliran pusat bandar berada pada 91% kapasiti.

Sebuah stesen metro bawah tanah, dua kawasan perumahan, dan hospital daerah berada dalam flood path.

Paparan pembukaan:

```text
HYDROLOGICAL EMERGENCY
River Level: 8.7 m and rising
Drainage Load: 91%
Peak Tide Estimate: 06:10
Threat Level: Critical
```

## 3. City Elements

- River and floodplain
- Levee and controllable floodgates
- Underground metro stations
- Pumping stations
- Central drainage network
- Riverside residential districts
- Elevated highway
- District hospital
- Public park retention basin
- Emergency shelters

## 4. User Mission

Arahan utama:

> Protect critical infrastructure and evacuate residents before the river overflows.

Constraints pilihan:

- Keep the hospital accessible.
- Do not flood the historic district.
- Preserve at least one metro tunnel for recovery access.
- Minimize displacement of residents.
- Limit emergency energy use to 70%.

## 5. Data Read by PLAN AI

- River level and rate of rise
- Rainfall radar and tide forecast
- Terrain elevation and water flow paths
- Drain capacity and blockage status
- Pump capacity and power requirement
- Population by building and mobility needs
- Road elevation and traffic capacity
- Hospital access and backup power

## 6. AI Analysis

PLAN AI menunjukkan tiga strategi:

```text
Strategy A: Maximum Pumping
Success Estimate: 68%
Risk: Grid overload

Strategy B: Controlled Diversion
Success Estimate: 89%
Risk: Park and commercial damage

Strategy C: Full Evacuation
Success Estimate: 76%
Risk: Severe traffic congestion
```

Strategi dipilih:

```text
Selected Strategy: Controlled Diversion
Estimated Success: 89%
Projected Displacement: 3,240 people
Primary Priority: Hospital and residential safety
```

## 7. Initial AI Plan

```text
01 - Forecast flood propagation
02 - Close vulnerable metro entrances
03 - Clear drainage blockages in Sector South
04 - Activate Pump Stations 2 and 4
05 - Deploy temporary river barriers
06 - Redirect overflow into the park retention basin
07 - Evacuate Riverside East through elevated roads
08 - Reserve backup power for the hospital
```

## 8. Simulation Sequence

### Step 1: Forecast

Bandar bertukar kepada topographic view. Air biru lut sinar menunjukkan keadaan semasa, manakala lapisan cyan, amber, dan merah menunjukkan jangkaan banjir pada minit ke-5, ke-10, dan ke-20.

### Step 2: Seal Underground Access

Pintu metro ditutup secara berurutan. Countdown menunjukkan masa sebelum air sampai ke setiap pintu masuk.

### Step 3: Restore Drainage Flow

Drone maintenance bergerak ke lokasi saliran tersumbat. Kadar aliran berubah secara langsung pada network overlay.

### Step 4: Pump and Divert

Pam diaktifkan dan temporary barriers muncul di tebing sungai. Sebahagian air dialihkan ke taman bandar yang berfungsi sebagai retention basin.

### Step 5: Evacuate

Traffic lanes pada elevated road ditukar kepada satu arah. Bas kecemasan mengambil penduduk dengan mobility risk paling tinggi terlebih dahulu.

## 9. User Decision Point

Sebelum diversion dilakukan, pengguna diberi trade-off yang jelas:

```text
Controlled Diversion Proposal

Protects: Hospital, Metro Central, 8,200 residents
Impacts: Riverside Park, 14 commercial units
Recovery Cost: Medium
Decision Window: 15 seconds
```

Pengguna boleh menerima pelan, melarang penggunaan taman, atau meminta PLAN AI mencari alternatif.

## 10. Disruption Event

Pump Station 4 kehilangan kuasa apabila pencawang berdekatan dimasuki air. Air kini meningkat lebih cepat di hospital district.

```text
PUMP STATION 4 OFFLINE
Drainage capacity reduced by 28%
Hospital access compromised in 02:20
Current plan viability: 58%
```

## 11. Re-plan

PLAN AI mengesan dependency antara pencawang, pam, dan akses hospital.

```text
ISOLATE     Flooded substation
TRANSFER    Mobile battery to Pump Station 4
REDIRECT    Emergency vehicles to North Bridge
EXPAND      Park retention zone by 18%
ACCELERATE  Hospital perimeter barrier
DELAY       Metro tunnel preservation task
```

PLAN AI menerangkan bahawa satu terowong metro akan dikorbankan untuk memastikan hospital kekal boleh diakses.

## 12. Mission Report

```text
MISSION COMPLETE

Residents evacuated       8,914
Population exposed        3.1%
Critical facilities       6 / 6 operational
Maximum flood depth       1.4 m
Metro stations protected  3 / 4
Emergency energy used     66%
Estimated recovery        2.8 days
```

Visual perbandingan menunjukkan kawasan banjir tanpa tindakan, dengan pelan awal, dan selepas re-plan.

---

# Mission 03: Heat Grid Critical

## 1. Mission Identity

**Tema:** Gelombang haba dan tekanan grid elektrik  
**Fokus bandar:** Tenaga, kesihatan awam, cooling centers, solar, bateri  
**Keupayaan AI:** Multi-objective optimization, equitable allocation, dan demand management

## 2. Situation

Bandar memasuki hari kelima gelombang haba. Suhu permukaan mencecah 44 darjah Celsius dan permintaan elektrik berada pada 96% kapasiti grid.

Kawasan padat dengan ramai warga emas menunjukkan risiko kesihatan paling tinggi. Transformer utama dijangka overload dalam masa tujuh minit jika penggunaan tidak dikurangkan.

```text
EXTREME HEAT EMERGENCY
Surface Temperature: 44 C
Grid Demand: 96%
Transformer Margin: 4%
Health Risk: Extreme
```

## 3. City Elements

- Residential districts with vulnerability scores
- Commercial district
- Central and community hospitals
- Cooling centers
- Solar farm
- Battery storage facility
- Electrical substations and transformers
- Metro and electric bus network
- Urban parks and shaded corridors
- Water distribution for cooling

## 4. User Mission

Arahan utama:

> Prevent a city-wide blackout while protecting vulnerable communities.

Constraints pilihan:

- Hospitals must retain full power.
- Protect districts with the highest heat vulnerability.
- Keep at least 20% battery reserve.
- Minimize commercial shutdowns.
- Keep carbon emissions below the emergency threshold.

## 5. Data Read by PLAN AI

- Air and surface temperature by district
- Population age and health vulnerability
- Building cooling demand
- Transformer temperature and load
- Solar generation forecast
- Battery state of charge
- Cooling center capacity
- Public transport energy use
- Backup generator emissions

## 6. AI Analysis

PLAN AI membina heat-energy dependency map. Daerah dengan suhu tertinggi tidak semestinya mempunyai risiko tertinggi; vulnerability penduduk juga diambil kira.

```text
Strategies Evaluated: 4
Selected Strategy: Protected Load Balancing
Estimated Grid Stability: 92%
At-Risk Population Reduction: 81%
Projected Battery Reserve: 23%
```

## 7. Initial AI Plan

```text
01 - Identify heat vulnerability clusters
02 - Open six temporary cooling centers
03 - Reduce non-critical commercial demand
04 - Shift metro and charging schedules
05 - Discharge battery storage during peak load
06 - Protect hospital and residential cooling circuits
07 - Deploy mobile cooling units to Sector West
08 - Monitor transformer temperature
```

## 8. Simulation Sequence

### Step 1: Reveal Heat Risk

Heatmap bergerak dari kuning kepada merah. Ikon populasi menunjukkan jumlah warga emas, kanak-kanak, dan individu dengan risiko kesihatan.

### Step 2: Open Cooling Centers

Bangunan awam bertukar menjadi cooling centers. Laluan pejalan kaki dan shuttle dipaparkan untuk setiap komuniti.

### Step 3: Demand Response

Bangunan komersial malap secara terkawal. Panel menunjukkan berapa megawatt yang dijimatkan tanpa menyebabkan seluruh daerah blackout.

### Step 4: Route Energy

Aliran tenaga divisualkan sebagai denyutan cahaya. PLAN AI memindahkan bekalan daripada beban bukan kritikal kepada hospital dan kawasan kediaman berisiko tinggi.

### Step 5: Protect Mobility

Kekerapan metro dikurangkan tetapi laluan menuju cooling centers dikekalkan.

## 9. User Decision Point

Pengguna perlu memilih nilai operasi utama:

```text
Priority Adjustment

[A] Maximum Grid Stability
[B] Maximum Public Health Protection
[C] Minimum Economic Disruption
[D] Balanced Response
```

Pilihan ini mengubah jumlah load shedding, lokasi cooling centers, dan penggunaan bateri.

## 10. Disruption Event

Awan tebal mengurangkan pengeluaran solar sebanyak 42%. Pada masa sama, Transformer T-7 mencapai suhu kritikal.

```text
SOLAR OUTPUT COLLAPSE
Generation loss: 42%
Transformer T-7: 108 C
Blackout propagation risk: High
Current plan viability: 49%
```

## 11. Re-plan

```text
SHED        35% commercial district load
PROTECT     Hospital and cooling center circuits
DISCHARGE   Additional 12% battery capacity
REDUCE      Metro frequency by 15%
DEPLOY      Mobile generators to Sector West
OPEN        Two shaded night shelters
```

PLAN AI menunjukkan siapa yang menerima perlindungan, siapa yang menerima pengurangan tenaga, dan sebab keputusan tersebut dibuat.

## 12. Mission Report

```text
MISSION COMPLETE

Grid stability             91%
Residents protected        92,400
Heat exposure incidents    74% below baseline
Commercial energy reduced  31%
Battery reserve            18%
Transformer failures       0
Emergency emissions        Moderate
```

Mission report mempunyai **Equity View** yang membandingkan kesan tindakan mengikut daerah dan vulnerability group.

---

# Mission 04: Wildfire Horizon

## 1. Mission Identity

**Tema:** Kebakaran hutan di pinggir bandar  
**Fokus bandar:** Evacuation, jalan raya, air, udara bersih, unit kecemasan  
**Keupayaan AI:** Dynamic forecasting, multi-agent coordination, dan congestion-aware routing

## 2. Situation

Kebakaran hutan bergerak dari barat laut menuju kawasan perumahan pinggir bandar. Tanah terlalu kering, kelembapan rendah, dan angin kencang menolak api ke arah dua daerah kediaman.

Asap sudah menjejaskan sekolah dan pusat jagaan. Jika semua daerah dipindahkan serentak, rangkaian jalan akan mengalami gridlock.

```text
WILDFIRE EMERGENCY
Fire Front Speed: 3.8 km/h
Wind: 41 km/h Northwest
Air Quality Index: 286
First Residential Impact: 08:40
```

## 3. City Elements

- Peri-urban forest and terrain
- Fire front and ember propagation
- Residential districts
- Schools and care centers
- Highway and local roads
- Reversible traffic lanes
- Fire stations and response units
- Water towers and hydrants
- Clean-air shelters
- Drone observation network

## 4. User Mission

Arahan utama:

> Contain the fire and evacuate threatened districts without creating traffic gridlock.

Constraints pilihan:

- Evacuate schools and care centers first.
- Maintain emergency vehicle access.
- Protect the northern water tower.
- Avoid routing civilians through hazardous smoke.
- Preserve at least 30% firefighting water reserve.

## 5. Data Read by PLAN AI

- Wind speed and direction
- Terrain, vegetation, and fuel dryness
- Current fire perimeter
- Ember jump probability
- Road capacity and current traffic
- Population and evacuation readiness
- Fire unit location and water level
- Air quality by district
- Shelter capacity

## 6. AI Analysis

PLAN AI mensimulasikan ribuan kemungkinan fire paths dan membandingkan beberapa evacuation schedules.

```text
Fire Paths Simulated: 1,200
Evacuation Schedules Tested: 36
Selected Strategy: Staggered Eastbound Evacuation
Estimated Clearance Time: 07:10
Containment Probability: 73%
```

## 7. Initial AI Plan

```text
01 - Predict fire and ember spread
02 - Establish containment line at Ridge 3
03 - Evacuate schools and care centers
04 - Open eastbound contraflow corridor
05 - Begin staggered district evacuation
06 - Protect the northern water tower
07 - Open clean-air shelters in Central District
08 - Reserve emergency lane for fire units
```

## 8. Simulation Sequence

### Step 1: Forecast Fire Spread

Fire cone bergerak mengikut arah angin. Uncertainty ditunjukkan sebagai beberapa sempadan separa telus, bukan satu garis ramalan yang terlalu pasti.

### Step 2: Establish Containment

Unit bomba dan drone bergerak ke Ridge 3. Garis containment dibina dan status setiap segmen dipaparkan.

### Step 3: Stagger Evacuation

Sekolah dan pusat jagaan bergerak dahulu, diikuti Zone W1, W2, dan W3 pada masa berlainan.

### Step 4: Reverse Traffic Lanes

Laluan masuk ditukar menjadi laluan keluar. Emergency lane kekal kosong untuk unit bomba dan ambulans.

### Step 5: Manage Smoke Exposure

PLAN AI mengubah laluan apabila plume asap bergerak. Bangunan clean-air shelter menyala sebagai destinasi sementara.

## 9. User Decision Point

Api menghampiri dua aset pada masa yang sama:

```text
RESOURCE CONFLICT

Option A: Protect 1,800 homes
Option B: Protect northern water tower

Losing the water tower reduces future containment capacity by 46%.
Decision Window: 18 seconds
```

PLAN AI mengesyorkan melindungi water tower kerana kesannya kepada keseluruhan operasi, tetapi pengguna boleh memilih sebaliknya.

## 10. Disruption Event

Angin berubah 35 darjah ke selatan. Ember jump mewujudkan kebakaran baharu di hadapan containment line. Sebuah kemalangan turut menutup jalan pemindahan utama.

```text
SECONDARY IGNITION DETECTED
Primary corridor blocked
District W2 clearance incomplete
Plan viability: 43%
```

## 11. Re-plan

```text
CLOSE       Eastbound Corridor A
OPEN        Service Road Delta
REVERSE     Southern arterial lanes
REASSIGN    Unit F-3 to secondary ignition
ADVANCE     District W2 evacuation
DELAY       District W3 departure by 90 seconds
REDIRECT    Smoke-exposed residents to Shelter C
```

Timeline berubah secara visual. Langkah lama ditandakan superseded dan dependency baharu disambungkan kepada pelan aktif.

## 12. Mission Report

```text
MISSION COMPLETE

Residents evacuated        21,480
Average clearance time     06:52
Population smoke exposure  8.4%
Structures lost            7%
Water reserve remaining    34%
Emergency route uptime     96%
Fire containment           81%
```

Replay akhir menunjukkan bagaimana staggered evacuation mengelakkan gridlock berbanding arahan pemindahan serentak.

---

# Mission 05: The Cascading Blackout

## 1. Mission Identity

**Tema:** Serangan siber dan kegagalan grid berantai  
**Fokus bandar:** Tenaga, komunikasi, pusat data, trafik, hospital, microgrid  
**Keupayaan AI:** Dependency reasoning, anomaly isolation, dan staged recovery

## 2. Situation

Beberapa pencawang pintar menghantar arahan yang bercanggah. Voltan tidak stabil mula merebak ke daerah bersebelahan. Lampu trafik, rangkaian metro, dan pusat data bandar bergantung pada bahagian grid yang sama.

PLAN AI perlu menentukan sama ada ini kerosakan teknikal atau serangan sebelum kegagalan merebak.

```text
GRID ANOMALY DETECTED
Substations affected: 3
Frequency stability: 94%
Propagation risk: High
Root cause: Unknown
```

## 3. City Elements

- Smart substations
- High-voltage transmission network
- District microgrids
- Hospitals
- Data centers
- Communications towers
- Traffic control network
- Metro signaling
- Emergency operations center
- Water pumping stations

## 4. User Mission

Arahan utama:

> Isolate the compromised network and restore essential city services.

Constraints pilihan:

- Never disconnect hospital microgrids.
- Preserve emergency communications.
- Avoid a full city shutdown.
- Verify each district before reconnection.
- Restore water pumps within ten minutes.

## 5. Data Read by PLAN AI

- Voltage, frequency, and load per substation
- Command history and authentication status
- Network dependencies
- Backup generator fuel
- Microgrid availability
- Service criticality
- Traffic and metro safety status
- Communications coverage
- Cyber anomaly confidence

## 6. AI Analysis

Bandar bertukar kepada graph view. Node dan sambungan menunjukkan hubungan tenaga, data, dan perkhidmatan.

```text
Anomalous Commands: 17
Probable Entry Point: Substation S-12
Compromise Confidence: 84%
Services at Immediate Risk: 6
Selected Strategy: Segmented Isolation
```

## 7. Initial AI Plan

```text
01 - Trace anomalous command propagation
02 - Isolate substations S-12, S-14, and S-18
03 - Switch hospitals to verified microgrids
04 - Restore emergency communications
05 - Activate manual traffic corridors
06 - Secure metro signaling in safe mode
07 - Restore water pumping priority circuit
08 - Reconnect verified districts in stages
```

## 8. Simulation Sequence

### Step 1: Detect and Trace

Denyutan merah bergerak antara network nodes. PLAN AI membezakan correlation daripada confirmed compromise menggunakan confidence labels.

### Step 2: Segment the Grid

Sambungan tertentu diputuskan. Daerah menjadi pulau tenaga yang dikawal oleh microgrid tempatan.

### Step 3: Protect Critical Services

Hospital, emergency center, dan communications towers menerima laluan tenaga berasingan.

### Step 4: Activate Manual Mobility

Persimpangan utama bertukar kepada emergency traffic mode. Metro berhenti secara selamat di platform terdekat.

### Step 5: Staged Restoration

Daerah diuji satu demi satu sebelum disambung semula. Setiap reconnect mempunyai countdown dan rollback condition.

## 9. User Decision Point

Satu pusat data mempunyai telemetry mencurigakan tetapi menyimpan lokasi unit kecemasan secara masa nyata.

```text
DATA CENTER C-2

Compromise probability: 63%
Operational value: Critical

Option A: Disconnect immediately
Option B: Isolate write access and monitor
Option C: Keep online with elevated risk
```

PLAN AI mengesyorkan isolation terhad sambil mengekalkan read-only emergency data.

## 10. Disruption Event

Ketika District North disambungkan semula, malicious command baharu muncul melalui sistem vendor yang sebelum ini dianggap selamat.

```text
REPEATED INTRUSION
New origin: Vendor Gateway V-4
District North restoration aborted
Communications risk: Elevated
Plan viability: 37%
```

## 11. Re-plan

```text
ROLLBACK    District North reconnection
QUARANTINE  Vendor Gateway V-4
ROTATE      Control credentials
MIGRATE     Emergency data to Local Node E-1
PRIORITIZE  Water pump restoration
DEFER       Commercial district recovery
VERIFY      All external control paths
```

PLAN AI menunjukkan bahawa pemulihan paling cepat bukan lagi objektif terbaik. Strategi berubah kepada **Trusted Recovery**, yang lebih perlahan tetapi mengurangkan risiko serangan berulang.

## 12. Mission Report

```text
MISSION COMPLETE

Critical services online   100%
Grid restored              87%
Compromised nodes isolated 5 / 5
Emergency communications   98% uptime
Water service restored     08:42
Repeated intrusion blocked Yes
Economic disruption        Moderate
```

Mission report memaparkan dependency chain yang berjaya dilindungi dan menunjukkan apa yang akan berlaku jika bandar melakukan reconnect terlalu awal.

---

# Mission 06: Water Zero

## 1. Mission Identity

**Tema:** Kemarau dan pencemaran bekalan air  
**Fokus bandar:** Reservoir, loji rawatan, paip, industri, hospital, agihan sosial  
**Keupayaan AI:** Long-horizon planning, fair resource allocation, dan contamination tracing

## 2. Situation

Selepas kemarau berpanjangan, reservoir bandar berada pada 24% kapasiti. Sensor kemudian mengesan bahan pencemar di saluran utama dari kawasan industri.

Bandar mempunyai bekalan selamat untuk kira-kira 14 hari, tetapi hanya jika penggunaan dikurangkan dan pencemaran dapat diasingkan.

```text
WATER SECURITY EMERGENCY
Reservoir Capacity: 24%
Safe Supply Estimate: 14 days
Contamination Detected: Eastern Main
Source Confidence: 41%
```

## 3. City Elements

- Main reservoir
- Water treatment plants
- Industrial district
- Agricultural and urban farms
- Residential districts
- Hospitals and clinics
- Pipeline and valve network
- Groundwater wells
- Mobile water distribution points
- Wastewater recycling facility

## 4. User Mission

Arahan utama:

> Maintain safe water access for the next 14 days while locating the contamination source.

Constraints pilihan:

- Hospitals receive uninterrupted safe water.
- Every district receives a minimum daily allocation.
- Protect groundwater from over-extraction.
- Avoid a complete industrial shutdown.
- Keep fire response reserves available.

## 5. Data Read by PLAN AI

- Reservoir volume and inflow forecast
- Water quality sensor readings
- Pipeline direction and pressure
- District demand and population
- Hospital and fire reserve requirements
- Industrial consumption
- Groundwater recharge rate
- Treatment plant capacity
- Mobile distribution capacity

## 6. AI Analysis

PLAN AI menghasilkan contamination probability map dan water balance untuk 14 hari.

```text
Probable Contamination Sources: 4
Highest Confidence Source: Industrial Outflow I-7
Current Safe Supply: 13.6 days
Selected Strategy: Isolate, Ration, Recycle
Projected Safe Supply: 18.2 days
```

## 7. Initial AI Plan

```text
01 - Isolate the Eastern Main pipeline
02 - Trace contamination upstream
03 - Protect hospital and fire reserves
04 - Introduce district water allocations
05 - Reduce industrial consumption by 38%
06 - Activate wastewater recycling capacity
07 - Open mobile water stations
08 - Begin controlled groundwater extraction
```

## 8. Simulation Sequence

### Step 1: Trace Contamination

Paip divisualkan sebagai network bawah bandar. Warna merah bergerak mengikut tekanan dan arah aliran, sementara candidate sources diberi confidence score.

### Step 2: Isolate Safely

Valve ditutup mengikut urutan untuk mengelakkan pressure collapse. Kawasan terjejas bertukar kepada bekalan alternatif.

### Step 3: Allocate Water

Setiap daerah menerima water budget. PLAN AI membezakan penggunaan asas, kesihatan, industri, dan penggunaan tidak kritikal.

### Step 4: Expand Supply

Loji recycling diaktifkan dan groundwater digunakan pada kadar yang tidak melebihi recovery threshold.

### Step 5: Distribute

Mobile water stations ditempatkan berdasarkan populasi, akses pengangkutan, dan vulnerability.

## 9. User Decision Point

Pengguna perlu menentukan dasar pengagihan:

```text
Water Allocation Policy

[A] Equal percentage reduction for all districts
[B] Minimum needs guaranteed first
[C] Protect economic activity
[D] Protect long-term ecological recovery
```

PLAN AI menerangkan bahawa pengurangan sama rata boleh memberi kesan tidak sama rata kerana corak penggunaan dan keperluan asas berbeza.

## 10. Disruption Event

Ujian baharu menunjukkan pencemaran telah memasuki tangki simpanan hospital daerah. Pada masa sama, satu pipeline alternatif kehilangan tekanan.

```text
HOSPITAL WATER ALERT
Storage contamination: Confirmed
Alternative line pressure: -32%
Safe reserve remaining: 03:10
Plan viability: 46%
```

## 11. Re-plan

```text
ISOLATE     Hospital storage tank
DELIVER     Mobile treatment unit
RESERVE     12 emergency water tankers
REDUCE      Industrial allocation to 45%
BOOST       Western line pressure
OPEN        Two new public distribution points
DEFER       Non-critical irrigation
```

PLAN AI turut mengubah pelan 14 hari supaya penggunaan groundwater tidak meningkat melebihi had mampan walaupun berlaku kecemasan hospital.

## 12. Mission Report

```text
MISSION COMPLETE

Population with safe access  98.7%
Hospital interruption        00:18
Safe supply extended         18.0 days
Industrial output retained   61%
Groundwater impact           Low
Contamination contained      96%
Minimum reserve protected    Yes
```

Mission report mempunyai slider hari 1 hingga hari 14 supaya pengguna boleh melihat kesan jangka panjang setiap keputusan.

---

# Mission 07: Seismic Aftershock

## 1. Mission Identity

**Tema:** Gempa bumi, kerosakan struktur, dan gempa susulan  
**Fokus bandar:** Search and rescue, jambatan, hospital, gas, jalan kecemasan  
**Keupayaan AI:** Planning under uncertainty, priority management, dan responder safety

## 2. Situation

Gempa bumi berskala besar baru melanda bandar. Data sensor tidak lengkap, beberapa jalan terhalang, dan komunikasi dengan District South terputus.

Model geologi menganggarkan gempa susulan berbahaya boleh berlaku dalam enam hingga sembilan minit.

```text
SEISMIC EMERGENCY
Primary Event: Magnitude 7.1
Buildings flagged: 42
Communications coverage: 68%
Aftershock window: 06:00 - 09:00
```

## 3. City Elements

- Residential and commercial buildings
- Structural health sensors
- Bridges and elevated roads
- Hospitals and field clinics
- Gas pipelines
- Fire stations and rescue teams
- Drone inspection fleet
- Rubble and blocked roads
- Emergency shelters
- Communications dead zones

## 4. User Mission

Arahan utama:

> Locate survivors, prevent secondary disasters, and maintain emergency access before the aftershock.

Constraints pilihan:

- Do not expose responders to high-collapse-risk structures.
- Keep one route open to each hospital.
- Shut down critical gas leaks first.
- Prioritize locations with confirmed survivor signals.
- Prepare all field teams for the aftershock window.

## 5. Data Read by PLAN AI

- Seismic and structural sensor readings
- Drone imagery and thermal signals
- Emergency calls and crowd reports
- Building occupancy estimates
- Road and bridge damage
- Gas pressure anomalies
- Rescue team skills and location
- Hospital capacity
- Aftershock probability

## 6. AI Analysis

Maklumat dibahagikan mengikut confidence. Laporan orang awam tidak dianggap sama dengan thermal detection atau structural sensor.

```text
Potential Survivor Sites: 19
High Confidence Sites: 7
Critical Gas Leaks: 3
Safe Emergency Corridors: 2
Selected Strategy: Risk-Weighted Rescue
```

## 7. Initial AI Plan

```text
01 - Scan structural and infrastructure damage
02 - Shut down critical gas lines
03 - Verify high-confidence survivor locations
04 - Clear two priority rescue corridors
05 - Stabilize access to Central Hospital
06 - Deploy specialized rescue teams
07 - Establish temporary communications relays
08 - Withdraw exposed teams before aftershock window
```

## 8. Simulation Sequence

### Step 1: Build the Damage Map

Bangunan diberi warna berdasarkan collapse probability. Confidence ring membezakan data pasti, anggaran, dan lokasi tanpa data.

### Step 2: Prevent Secondary Hazards

PLAN AI menutup gas valves dan menghantar drone ke lokasi yang tidak selamat untuk manusia.

### Step 3: Identify Survivors

Thermal pulse dan audio sensors mengesahkan survivor signals. Queue misi berubah berdasarkan peluang menyelamat dan masa yang diperlukan.

### Step 4: Clear Corridors

Unit berat membersihkan jalan yang membuka akses kepada beberapa lokasi serentak, bukan semata-mata lokasi paling dekat.

### Step 5: Coordinate Rescue Teams

Setiap pasukan menerima tugas berdasarkan peralatan, risiko, dan masa sebelum aftershock.

## 9. User Decision Point

Dua operasi memerlukan unit rescue yang sama:

```text
PRIORITY CONFLICT

Site A: 4 confirmed survivors, high collapse risk
Site B: 11 probable survivors, medium confidence

Available heavy rescue team: 1
Aftershock earliest estimate: 04:20
```

PLAN AI memberikan recommendation berserta confidence, tetapi pengguna membuat keputusan akhir.

## 10. Disruption Event

Gempa susulan awal meruntuhkan South Bridge dan menyebabkan gas leak baharu berhampiran Central Hospital. Pasukan Rescue 3 terputus daripada laluan asal.

```text
AFTERSHOCK DETECTED
South Bridge: Collapsed
New gas leak: Hospital District
Rescue Team 3: Route unavailable
Plan viability: 34%
```

## 11. Re-plan

```text
HALT        South Bridge movement
REROUTE     Rescue Team 3 via Tunnel West
PRIORITIZE  Hospital gas isolation
DEPLOY      Drone relay over communications dead zone
REASSIGN    Heavy Rescue Team to Site A
CONVERT     School field into temporary clinic
RECALCULATE Building collapse risk
```

Pelan baharu membezakan tindakan yang perlu dilakukan segera, tindakan yang selamat ditangguhkan, dan lokasi yang tidak lagi boleh dimasuki.

## 12. Mission Report

```text
MISSION COMPLETE

Survivors located           38
Survivors rescued           31
Secondary fires prevented   4
Emergency corridors active  3
Responder injuries          0
Hospital access maintained  Yes
Unresolved sites            3
```

Mission report menyimpan uncertainty log supaya pengguna dapat melihat keputusan yang dibuat dengan data tidak lengkap.

---

# Final Mission: Compound Crisis

## 1. Mission Identity

**Tema:** Kegagalan bandar berantai  
**Fokus bandar:** Semua sistem dan dependency antara sistem  
**Keupayaan AI:** System-of-systems planning, competing priorities, dan continuous adaptation

## 2. Situation

Ribut tropika menghasilkan banjir kilat di pusat bandar. Banjir menutup dua pencawang, kehilangan tenaga mematikan pam air, hospital mula menggunakan bateri kecemasan, dan sebahagian rangkaian komunikasi terputus.

Pada masa sama, jalan utama sesak dengan penduduk yang cuba berpindah tanpa koordinasi.

```text
COMPOUND URBAN EMERGENCY
Active threats: 5
Critical dependencies affected: 11
Hospital battery: 38 minutes
Population at immediate risk: 18,400
System stability: 42%
```

## 3. City Elements

- River, drainage, and flood zones
- Power grid and microgrids
- Water pumps and treatment plant
- Hospitals and emergency services
- Roads, bridges, metro, and evacuation traffic
- Communications towers and local relays
- Residential vulnerability zones
- Shelters and supply depots
- Economic and recovery indicators

## 4. User Mission

Arahan utama:

> Stabilize the city, protect vulnerable communities, and restore essential services within 30 minutes.

Sebelum misi bermula, pengguna memilih nilai utama:

```text
[A] Save the greatest number of people
[B] Protect the most vulnerable communities
[C] Restore the city as quickly as possible
[D] Minimize long-term environmental damage
[E] Use a balanced resilience strategy
```

Pilihan ini mengubah scoring, priority, dan strategi yang dihasilkan.

## 5. Data Read by PLAN AI

Semua lapisan bandar digunakan serentak. PLAN AI juga membina dependency graph seperti berikut:

```text
Substation S-4
  -> Pump Station P-2
  -> Hospital Water Supply
  -> Hospital Operations
  -> District Emergency Capacity

Communications Tower C-1
  -> Traffic Coordination
  -> Evacuation Speed
  -> Ambulance Access
```

## 6. AI Analysis

PLAN AI mengenal pasti bahawa menyelesaikan ancaman secara berasingan akan gagal. Pelan mesti melindungi dependency yang membuka beberapa manfaat sekali gus.

```text
Dependencies Mapped: 47
Critical Bottlenecks: 6
Strategies Evaluated: 12
Selected Strategy: Essential Systems Spine
Estimated Stabilization: 24:30
Confidence: 78%
```

## 7. Initial AI Plan

```text
01 - Establish emergency communications backbone
02 - Protect hospital power and water supply
03 - Restore Pump Station P-2 through mobile microgrid
04 - Divert floodwater into retention zones
05 - Open coordinated evacuation corridors
06 - Restore traffic control on emergency routes
07 - Stabilize water treatment operations
08 - Reconnect priority residential districts
09 - Begin staged city recovery
```

## 8. Simulation Sequence

### Step 1: Build the Dependency Graph

Dunia 3D diperlahankan. Garis network menghubungkan aset bandar dan menunjukkan kesan setiap kegagalan.

### Step 2: Establish the Essential Spine

PLAN AI tidak cuba memulihkan seluruh bandar. Ia membina rangkaian minimum yang menghubungkan komunikasi, hospital, pam, dan laluan kecemasan.

### Step 3: Control Flooding

Flood barriers dan pumping digunakan hanya pada lokasi yang melindungi dependency kritikal.

### Step 4: Coordinate Movement

Traffic lights kecemasan, evacuation lanes, dan ambulance routes diselaraskan melalui rangkaian komunikasi sementara.

### Step 5: Begin Recovery

Selepas sistem penting stabil, PLAN AI menyambung semula daerah secara berperingkat berdasarkan risiko dan keperluan komuniti.

## 9. First Disruption Event

Mobile microgrid yang membekalkan hospital dan Pump Station P-2 tidak mempunyai tenaga mencukupi untuk kedua-duanya.

```text
ENERGY CONFLICT

Hospital requirement: 18 MW
Pump requirement: 11 MW
Available mobile supply: 24 MW
Shortfall: 5 MW
```

PLAN AI mencadangkan pengurangan beban hospital bukan klinikal, tetapi pengguna boleh memilih untuk memperlahankan pam atau menutup bangunan lain.

## 10. Second Disruption Event

Hujan bertambah kuat dan komunikasi dengan District East hilang. Laporan awam menunjukkan shelter utama mungkin sudah penuh, tetapi data tidak dapat disahkan.

```text
DATA UNCERTAINTY INCREASED
District East telemetry: Offline
Shelter capacity report: Unverified
Flood rise rate: +31%
Plan viability: 39%
```

## 11. Re-plan

```text
DEPLOY      Drone communications relay
VERIFY      District East shelter capacity
REDUCE      Non-clinical hospital load
BOOST       Pump Station P-2 temporarily
OPEN        Secondary shelter at Stadium North
DIVERT      East evacuation route
DEFER       Commercial grid restoration
EXPAND      Flood retention zone
```

PLAN AI menerangkan dependency yang mempengaruhi keputusan:

```text
Restoring communications
  -> verifies shelter capacity
  -> prevents route congestion
  -> improves ambulance access
  -> reduces evacuation time
```

## 12. Final Decision

Bandar hampir stabil tetapi hanya satu tindakan besar boleh dilakukan sebelum tenaga kecemasan berkurang:

```text
FINAL RESOURCE ALLOCATION

Option A: Restore water treatment
Option B: Reconnect 12,000 residential users
Option C: Increase flood pumping
Option D: Preserve reserve for unknown events
```

PLAN AI memberikan recommendation berdasarkan nilai yang dipilih pengguna pada awal misi. Dua pengguna dengan nilai berlainan boleh menerima pelan berlainan tetapi kedua-duanya boleh diterangkan dan dinilai.

## 13. Mission Report

```text
CITY STABILIZED

Population protected         95.2%
Vulnerable groups protected  97.8%
Critical services online     92%
Infrastructure damage        16%
Emergency energy remaining   9%
Carbon impact                Moderate
Plan adaptations             5
Stabilization time            27:14
Recovery estimate             4.2 days
```

Laporan akhir mempunyai empat paparan:

1. **Outcome** - Apa yang berjaya dan gagal.
2. **Decision Timeline** - Bagaimana pelan berubah.
3. **Trade-off Map** - Siapa dan sistem mana menerima manfaat atau kos.
4. **Counterfactual** - Apa yang dijangka berlaku tanpa PLAN AI atau tanpa re-plan.

---

# 4. Scenario Selection Experience

Selepas opening cinematic, pengguna masuk ke **Scenario Atlas**. Bandar yang sama dipaparkan dalam keadaan normal, dengan beberapa scenario cards mengelilinginya.

```text
01  The Frozen Storm       Climate / Energy
02  Operation Rising Tide  Water / Mobility
03  Heat Grid Critical     Energy / Public Health
04  Wildfire Horizon       Environment / Evacuation
05  Cascading Blackout     Cyber / Infrastructure
06  Water Zero             Resources / Sustainability
07  Seismic Aftershock     Structural / Emergency Response
08  Compound Crisis        Full City Systems
```

Setiap card menunjukkan:

- Threat type
- Systems affected
- Estimated mission duration
- AI capabilities demonstrated
- Difficulty
- Previous best resilience score

# 5. Shared Mission Control UI

## Left Panel: Mission Control

- Natural-language objective
- Mission presets
- Constraints
- Priority selector
- Generate Plan
- Execute Simulation
- Inject Event
- Pause and request re-plan

## Right Panel: AI Plan

- Selected strategy
- Step list and status
- Reason for active action
- Confidence
- Resource use
- Risk and dependency impact

## Bottom Panel: Execution Timeline

```text
OBSERVE -> PRIORITIZE -> PLAN -> EXECUTE -> ADAPT -> RECOVER
```

Timeline membenarkan pengguna pause, scrub, melihat pelan lama, dan membandingkan pelan baharu selepas disruption.

## World Overlays

- Threat forecast
- Population vulnerability
- Infrastructure dependency
- Energy flow
- Water flow
- Evacuation routes
- Confidence and uncertainty
- Damage and recovery state

# 6. Reusable PLAN AI Output Contract

Semua scenario boleh menggunakan struktur pelan yang sama supaya simulation engine tidak bergantung kepada satu jenis ancaman.

```json
{
  "missionId": "rising-tide",
  "objective": "Protect critical infrastructure and evacuate residents",
  "strategy": {
    "name": "Controlled Diversion",
    "confidence": 0.89,
    "priorities": ["civilian_safety", "hospital_access"]
  },
  "constraints": [
    "keep_hospital_accessible",
    "energy_use_below_70_percent"
  ],
  "steps": [
    {
      "id": "activate-pumps",
      "action": "ACTIVATE_SYSTEM",
      "target": "pump-station-2",
      "status": "queued",
      "duration": 8,
      "reason": "Reduce water accumulation near the hospital district",
      "dependencies": ["substation-east"],
      "resourceCost": { "energy": 12 },
      "successCondition": "district-water-level-below-1.2m"
    }
  ],
  "fallbacks": [
    {
      "trigger": "pump-station-2-offline",
      "strategy": "mobile-battery-reroute"
    }
  ]
}
```

# 7. Recommended Production Scope

## Showcase MVP

Empat demo pertama yang patut dibina:

1. **The Frozen Storm** - menggunakan effects Ice dan Lightning sedia ada.
2. **Operation Rising Tide** - memperkenalkan terrain, water flow, dan infrastructure protection.
3. **Heat Grid Critical** - memperkenalkan resource allocation dan social impact.
4. **The Cascading Blackout** - memperkenalkan dependency graph dan staged recovery.

Keempat-empat misi boleh menggunakan bandar, UI, timeline, camera system, dan plan executor yang sama.

## Expansion Pack

- Wildfire Horizon
- Water Zero
- Seismic Aftershock

## Final Showcase

- Compound Crisis
- Free Simulation Mode
- Custom natural-language objectives
- User-created disruption events
- Scenario comparison and exportable mission report

# 8. Product Narrative

Urutan showcase penuh membawa pengguna melalui peningkatan tahap AI:

```text
Single Threat
  -> Multiple Objectives
  -> Resource Trade-offs
  -> Unexpected Disruption
  -> Live Re-planning
  -> Interdependent City Systems
  -> Long-Term Recovery
```

Mesej akhirnya ialah:

> PLAN AI tidak hanya meramal apa yang mungkin berlaku. Ia membantu manusia memahami pilihan, membina tindakan yang boleh diperiksa, dan menyesuaikan pelan apabila dunia berubah.
