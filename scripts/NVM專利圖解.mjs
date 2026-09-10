import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'data/NVM專利附圖.json'),'utf8'));
const L=(zh,en)=>({zh,en});
const defs={
 US7417300B2:{
  images:[[2,'Fig. 4 / 4A',90,4]],
  focus:L('把失效位置導向可預期的區域','Steer the programmed resistance change into a controlled region'),
  trace:L('先比較端點與細頸寬度，再追蹤電流擁擠和局部熱梯度；這張圖的設計變數是幾何與材料分布。','Compare the terminal and neck widths, then trace current crowding and the local thermal gradient. Geometry and material distribution are the design variables.'),
  callouts:[['410 / 420',L('兩個端點；寬度不是相同的細線','Terminal regions, wider than the connecting fuse')],['430',L('狹長熔絲本體，連接兩個端點','Elongated fuse joining the terminals')],['440',L('端點中的縮頸區；與熔絲本體分開辨認','Narrowed region within the terminal, distinct from the fuse link')]],
  claim:L('權利項 1 同時限定端點縮頸、矽化物／多晶矽的不同平面形狀，以及未矽化邊界。圖 4A 用來理解縮頸，但權利項的材料與邊界條件仍須回讀全文。','Claim 1 combines terminal narrowing, different silicide and polysilicon footprints, and unsilicided boundaries. Figure 4A explains the narrowing; the material and boundary requirements remain part of the claim.'),
  bridge:L('對照 eFuse 寫入序列：電流路徑 → 材料遷移 → 高阻態。不要把所有 eFuse 都畫成同一種均勻熔斷。','Compare the eFuse write sequence: current path → material redistribution → high resistance. Different fuse stacks need different physical failure models.')
 },
 US8847350B2:{
  images:[[5,'Fig. 4A–4C',90,6]],
  focus:L('利用導孔的局部接觸面控制程式化位置','Control the programming location through partial via contact'),
  trace:L('由俯視圖的金屬連線，對照兩個剖面中的導孔落點。接觸面積縮小會集中電流與局部發熱。','Follow the top-view metal link into the two via cross-sections. A smaller contact area concentrates current and local heating.'),
  callouts:[['410 / 420',L('陽極與陰極端點','Anode and cathode terminals')],['430',L('金屬熔絲連線','Metal fuse link')],['435 / 435A / 435B',L('導孔及其接觸部分；比較導孔與連線的重疊','Via plugs and contact portions; compare their overlap with the link')]],
  claim:L('權利項 1 的關鍵是導孔一端只有部分面積落在熔絲連線上，並限定兩層金屬間的連接。尺寸、電阻與其他條件分布在從屬項。','Claim 1 requires a via end that lands only partly on the fuse link and specifies the connection between two metal layers. Dimensions, resistance and other conditions appear in dependent claims.'),
  bridge:L('對照金屬導孔 eFuse 的局部加熱與分離。此例不能直接沿用矽化物電遷移的材料圖說。','Compare localized heating and separation in a metal-via fuse. Its material explanation differs from the silicide electromigration example.')
 },
 US6667902B2:{
  images:[[3,'Fig. 3',0,5],[8,'Fig. 8',90,10]],
  focus:L('把介電層擊穿與陣列選擇分開設計','Separate dielectric breakdown from array selection'),
  trace:L('先在圖 3 找到儲存元件與選擇電晶體，再用圖 8 對照選中與未選中的偏壓組合。表內電壓只屬於此實施例。','Locate the storage element and select transistor in Figure 3, then compare selected and unselected biases in Figure 8. The listed voltages belong to this embodiment.'),
  callouts:[['311 / 312',L('儲存端導電閘極與其下方薄閘介電層','Conductive storage gate and underlying thin gate dielectric')],['313',L('主動區；擊穿後形成儲存端的導電路徑','Active region participating in the post-breakdown current path')],['111 / 115',L('相鄰元件的配置；必須連同選擇線閱讀','Adjacent device arrangement; read with the selection lines')]],
  claim:L('權利項 1 結合 MOS 選擇電晶體、薄介電層儲存元件，以及列選擇、行選擇與列程式化線。只看到擊穿剖面，還不足以讀完其陣列連接限定。','Claim 1 combines a MOS select transistor, a thin-dielectric storage element, and row-select, column-select and row-program lines. The breakdown cross-section alone does not capture the array connections.'),
  bridge:L('對照反熔絲操作：完整介電層 → 選中後高電場 → 永久導電路徑；讀取採低刺激。','Compare antifuse operation: intact dielectric → selected high field → permanent conduction path, followed by low-stress sensing.')
 },
 US4115914A:{
  images:[[2,'Fig. 3h / 3i / 4',0,4]],
  focus:L('用局部薄介電層提供電荷進出路徑','Provide charge transfer through a localized thin dielectric'),
  trace:L('由製程末段剖面辨認浮動閘、局部薄區與上方控制閘。薄區的位置及第二介電層的覆蓋，決定耦合與穿隧路徑。','Identify the floating gate, localized thin region and upper control gate in the late process cross-sections. Thin-region placement and the second dielectric determine coupling and tunneling paths.'),
  callouts:[['54',L('第一介電層；包含局部較薄區域','First dielectric containing the localized thin region')],['56',L('被絕緣包覆的浮動閘','Insulated floating gate')],['58 / 62',L('第二介電層與上方第二閘極','Second dielectric and upper second gate')]],
  claim:L('權利項 1 是製作方法：形成主動區、局部薄介電層、浮動閘、隔離它的第二介電層，以及覆蓋通道的第二閘極。不可把方法項簡化成所有 EEPROM 的一般結構。','Claim 1 is a fabrication method: active regions, a localized thin dielectric, floating gate, isolating second dielectric and second gate covering the channel. Its process requirements are more specific than a generic EEPROM sketch.'),
  bridge:L('對照 EEPROM 的 FN 進入與 FN 移出：兩個方向都必須穿過實際存在的薄介電層。','Compare EEPROM FN injection and removal: both directions must pass through the actual thin dielectric region.')
 },
 US5844271A:{
  images:[[1,'Fig. 4–7',0,3]],
  focus:L('單層多晶矽以埋入控制端耦合浮動閘','Couple a single-poly floating gate through a buried control node'),
  trace:L('在剖面找出埋入式控制區與浮動閘重疊，再用等效電路區分耦合端、儲存閘與可導通的通道。','Find the overlap between the buried control region and floating gate, then use the equivalent circuit to distinguish coupling, storage and channel conduction.'),
  callouts:[['32',L('埋入式控制閘的 n+ 區','Buried n+ control-gate region')],['36',L('單層多晶矽浮動閘','Single-poly floating gate')],['40 / 42 / 44',L('源極、汲極與通道','Source, drain and channel')]],
  claim:L('權利項 1 包含埋入控制閘、耦合的浮動閘，以及延伸跨過部分通道與接面的薄穿隧區，並限定過度抹除時未選中元件的抑制作用。權利項 4 另寫分離閘結構。','Claim 1 includes a buried control gate, coupled floating gate and a thin tunnel region spanning part of the channel and a junction, with inhibition of an unselected overerased cell. Claim 4 separately specifies a split-gate structure.'),
  bridge:L('對照 MTP IP 專題的單層多晶矽教學變體：本案的 CHE 注入與 FN 移出對應埋入式控制端，浮動閘上方沒有第二層控制多晶矽。現行產品的操作機制另依其具名文件核對。','Compare the MTP IP study’s single-poly teaching variant: this patent’s CHE injection and FN removal use a buried control node, with no second control-poly layer above the floating gate. Current product mechanisms require their own documentation.')
 },
 US6232180B1:{
  images:[[2,'Fig. 5 / 6',0,4]],
  focus:L('以源極耦合、分離閘與井區偏壓控制操作','Control operation with source coupling, split gates and well bias'),
  trace:L('從圖 5 的浮動閘成形讀到圖 6 的源／汲極，再追蹤選擇閘與薄穿隧氧化層的位置。深井使抹除偏壓具有獨立控制路徑。','Follow floating-gate formation in Figure 5 into the source/drain structure in Figure 6. Locate the select gate and tunnel oxide; the nested wells support separately controlled erase bias.'),
  callouts:[['501 / 113',L('浮動閘與選擇閘','Floating gate and select gate')],['403',L('通道側的穿隧氧化層','Tunnel oxide toward the channel')],['103 / 105',L('深 n 井及其中的 p 井','Deep n-well and enclosed p-well')]],
  claim:L('權利項 1 指定深 n 井、p 井、選擇閘、浮動閘及作為控制耦合端的源極。權利項 4–6 再限定特定抹除與程式化偏壓；數字不可當成所有分離閘 NOR 的規格。','Claim 1 specifies nested wells, select and floating gates, and a source acting as the control-coupling node. Claims 4–6 add particular erase and programming biases; these values do not define all split-gate NOR.'),
  bridge:L('對照第三個 NOR 變體：源側注入與井區／通道側 FN 抹除，和向選擇閘穿隧的實作分開。','Compare the third NOR variant: source-side injection and well/channel-side FN erase, separately from implementations that tunnel toward a select gate.')
 },
 WO1981000790A1:{
  images:[['頁14','Fig. 1',90,14]],
  focus:L('在電荷捕獲層與閘極間加入阻擋氧化層','Add a blocking oxide between the charge-trapping layer and gate'),
  trace:L('沿閘堆疊由矽基板往上讀：薄記憶氧化層、氮化矽、介面氧化層，再到多晶矽閘。這是材料堆疊導讀。','Read upward from silicon: thin memory oxide, silicon nitride, interfacial oxide and polysilicon gate. The drawing explains the dielectric stack.'),
  callouts:[['11 / 12',L('薄記憶氧化層與氮化矽捕獲層','Thin memory oxide and nitride trapping layer')],['13 / 14',L('介面氧化層與多晶矽閘','Interfacial oxide and polysilicon gate')],['16 / 17 / 18',L('基板及源／汲極區','Substrate and source/drain regions')]],
  claim:L('權利項 1 限定 CVD 形成的第二氧化層及其厚度範圍，並限定第一氧化層上限；權利項 6 是製作方法。此早期 SONOS 堆疊不能直接代表後來所有穿隧工程配方。','Claim 1 specifies a CVD second oxide with a thickness range and an upper limit for the first oxide. Claim 6 covers fabrication. This early SONOS stack does not specify every later engineered tunneling stack.'),
  bridge:L('對照 SONOS 操作時，分清底部穿隧氧化層與頂部阻擋氧化層；儲存位置在氮化層。','For SONOS operation, distinguish the lower tunnel oxide from the upper blocking oxide. Stored charge resides in the nitride.')
 },
 US5768192A:{
  images:[[2,'Fig. 5A / 5B',0,4],[4,'Fig. 8A / 8B',0,6]],
  focus:L('利用局部捕獲與反向讀取放大感測差異','Use localized trapping and reverse read to increase sensing contrast'),
  trace:L('比較標示先前技術的 A 圖與實施例 B 圖，再追蹤局部電荷區和 READ 箭頭。讀取方向改變了哪一端的能障最影響電流。','Compare the prior-art A panels with embodiment B panels. Trace the localized charge region and READ arrow; reading direction changes which end of the channel barrier controls current.'),
  callouts:[['14 / 16',L('源／汲極標號；操作時需同時看偏壓方向','Source/drain labels; interpret them with the operating bias')],['20',L('非導電氮化矽捕獲層','Nonconducting nitride trapping layer')],['24 / 68',L('控制閘與局部儲存電荷區','Control gate and localized stored-charge region')]],
  claim:L('權利項 1 結合局部電子捕獲、靠近程式化汲極的儲存區，以及反向與同向讀取呈現不同臨界電壓。不能只留下 ONO 堆疊而省略方向性。','Claim 1 combines localized electron trapping near the programming drain with different thresholds for reverse and forward read. The directional behavior is essential to the reading, beyond the ONO stack alone.'),
  bridge:L('對照局部 NROM 序列：CHE 電子留在一端；反向讀取從相反方向感測；BBHH 抹除另以有來源的變體說明。','Compare the localized NROM sequence: CHE stores electrons near one end, reverse read senses from the opposite direction, and BBHH erase is explained with its separate source.')
 },
 US7696559B2:{
  images:[[2,'Fig. 2',90,4],[5,'Fig. 6',90,7]],
  focus:L('把平面 NAND 串列轉成垂直堆疊','Move the NAND string into a vertical gate stack'),
  trace:L('圖 2 由底部共用源極沿矽柱往位元線讀；圖 6 再把同一結構展開為串列電路。選擇閘位於記憶閘堆疊的兩端。','In Figure 2, trace the silicon pillar from the common source to the bit line. Figure 6 unfolds the same structure into a string circuit, with select gates at both ends.'),
  callouts:[['21',L('堆疊閘配線，包含記憶閘與端點選擇閘','Stacked gate wiring, including memory and end-select gates')],['3 / 4',L('含電荷儲存層的閘介電層與矽柱','Charge-storage gate dielectric and silicon pillar')],['7 / 11',L('上方位元線與底部共用源極擴散區','Upper bit line and lower common-source diffusion')]],
  claim:L('權利項 1 詳列閘堆疊、含絕緣儲存層的側壁介電層、柱狀半導體、資料線與上下選擇閘。它是具體垂直 NAND 結構，不能把附圖當成所有現代圓柱孔陣列的版圖。','Claim 1 specifies gate stacks, sidewall dielectric containing an insulating storage layer, semiconductor pillars, data lines and upper/lower select gates. It describes a particular vertical NAND structure, not every modern cylindrical-hole array.'),
  bridge:L('對照 NAND 操作：選中字線的注入、未選字線的通過偏壓與寫入抑制；此專利的源極電子移出和後來 GIDL 電洞抹除分開呈現。','Compare selected-word-line injection, pass biases and program inhibit. This patent’s source-side electron removal is shown separately from later GIDL hole-assisted erase.')
 },
 US6545906B1:{
  images:[[2,'Fig. 3 / 4',0,3],[3,'Fig. 5 / 6',90,4]],
  focus:L('用交錯脈衝讓耦合磁矩完成翻轉','Rotate coupled moments with overlapping field pulses'),
  trace:L('先看圖 4 的兩條脈衝時序，再沿圖 5／6 逐格追蹤磁矩。兩條線同時作用的區間與結束順序是操作的一部分。','Start with the two pulse waveforms in Figure 4, then follow the moments through Figures 5 and 6. The overlap interval and turn-off order are part of the operation.'),
  callouts:[['60 / 70',L('字線與 digit line 脈衝','Word-line and digit-line pulses')],['100',L('整組交錯寫入時序','Complete overlapping write sequence')],['40 / 53 / 57',L('合成磁矩及反鐵磁耦合子層磁矩','Resultant moment and antiferromagnetically coupled sublayer moments')]],
  claim:L('權利項 1 同時要求至少兩層反鐵磁耦合自由層、磁矩平衡條件，以及 t₀<t₁<t₂<t₃<t₄ 的脈衝順序。不是任意兩個正交磁場都具有相同結果。','Claim 1 combines at least two antiferromagnetically coupled free layers, a moment-balance condition and pulse order t₀<t₁<t₂<t₃<t₄. Arbitrary orthogonal field pulses are not equivalent.'),
  bridge:L('對照 Toggle 的五格序列與初態檢查：需要改寫時才觸發翻轉。','Compare the five-frame Toggle sequence and initial-state check: apply a toggle when the stored bit needs to change.')
 },
 US5695864A:{
  images:[[0,'Fig. 1 / 2',0,2]],
  focus:L('以穿層電流把自旋角動量傳給可轉動磁層','Transfer spin angular momentum with current through the layers'),
  trace:L('圖 1 是五層金屬導體模型，沿 A→F1→B→F2→C 讀出固定與可變磁矩，再比較電流方向與 F2 的轉矩。','Figure 1 is a five-layer metallic-conductor model. Follow A→F1→B→F2→C to locate fixed and variable moments, then relate current to torque on F2.'),
  callouts:[['10',L('五層自旋轉移元件','Five-layer spin-transfer device')],['F1 / F2',L('固定磁矩層與可改變磁矩層','Fixed-moment and changeable-moment magnetic layers')],['A / B / C',L('兩端電極與中央非磁性導體；電流垂直穿過各層','Outer electrodes and central nonmagnetic conductor; current crosses the layers')]],
  claim:L('權利項 1 限定固定／可變磁導體層、其間非磁導體與穿層電流源。這個早期自旋轉移實施例使用金屬間隔，不是現代 MgO 穿隧障壁剖面。','Claim 1 specifies fixed and changeable magnetic conducting layers, a nonmagnetic conductor between them and a perpendicular current source. This early embodiment has a metallic spacer, rather than a modern MgO tunnel barrier.'),
  bridge:L('以這件專利理解自旋轉移原理，再用現代 STT-MRAM 圖區分 P／AP 電阻讀取與穿隧障壁。','Use this patent for spin-transfer physics, then the modern STT-MRAM plates for P/AP resistance sensing and the tunnel barrier.')
 },
 US10930843B2:{
  images:[[3,'Fig. 3',90,5]],
  focus:L('把 SOT 寫入導線與磁性堆疊組成可整合陣列','Integrate SOT write conductors and magnetic stacks into an array'),
  trace:L('追蹤水平第一配線，再經過其上磁性堆疊至另一方向配線。圖中控制電晶體和交叉配線比單一 MTJ 更能說明陣列整合成本。','Trace the first horizontal wire through the magnetic stack to wiring in the other direction. Access transistors and crossing interconnect explain array integration beyond one MTJ.'),
  callouts:[['102a / 102b',L('第一導電配線，提供橫向寫入路徑','First conductive wires carrying the lateral write path')],['108 / 110 / 112',L('磁性儲存層、間隔層與參考層','Magnetic storage, spacing and reference layers')],['116 / 118 / 314',L('控制電晶體與另一組配線','Control transistors and second wiring set')]],
  claim:L('權利項 1 是製造方法，限定第一導電層分離成配線、其上共同元件層的形成與分離，以及不同方向的第二配線。圖可解釋連接，權利項主軸仍是製程順序。','Claim 1 is a fabrication method covering isolated first wires, common device layers formed and separated above them, and second wires in another direction. The drawing explains connectivity; the claim centers on fabrication steps.'),
  bridge:L('對照 SOT 三端讀寫分離；附圖中的多重控制端必須保留，不能簡化成 STT 的同一路徑。','Compare three-terminal SOT read/write separation. Preserve the control terminals rather than reducing them to the STT current path.')
 },
 US8331131B2:{
  images:[[4,'Fig. 5',90,5]],
  focus:L('利用中間態與第二脈衝控制阻態切換','Control resistance switching through an intermediate state and second pulse'),
  trace:L('沿圖 5 的循環箭頭逐格看可移動物種、障壁與導電區如何改變。中間態有明確物理位置，不能省略成一次 SET／RESET。','Follow the Figure 5 cycle through mobile-species, barrier and conductive-region changes. The intermediate state has a physical location; it is not a single-step SET/RESET diagram.'),
  callouts:[['507',L('可移動物種','Mobile species')],['502 / 506 / 510',L('初始、中間與改變後的狀態','Initial, intermediate and changed states')],['511 / 517 / 519',L('各階段的穿隧障壁','Tunneling barriers in the different stages')]],
  claim:L('權利項 1 規定三個中間層與兩個脈衝：先累積到第一層，再移往第三層完成改變。這是特殊多層 memristor 操作，不能代替所有 VCM 的通用雙極序列。','Claim 1 requires three intermediate layers and two pulses: accumulation in the first layer, then motion into the third to complete the change. This specific multilayer memristor scheme does not define all bipolar VCM.'),
  bridge:L('對照 VCM 操作，保留氧空缺／物種重分布的物理意義；這件專利另展示脈衝路徑如何增加中間態。','Compare species redistribution in VCM operation; this patent additionally shows how pulse sequencing introduces an intermediate state.')
 },
 US5761115A:{
  images:[[0,'Fig. 1A / 1B / 2 / 3',0,3],[1,'Fig. 4A / 4B / 5A / 5B',0,4]],
  focus:L('在離子導體中可逆生成金屬橋','Reversibly grow a metal bridge inside an ion conductor'),
  trace:L('在圖 1 的平面與剖面中追蹤枝晶，再比較圖 4 的垂直配置。圖 5 另加入阻止直接接觸的隔離條件。','Trace the dendrite in Figure 1’s plan and cross-section, then compare the vertical geometry in Figure 4. Figure 5 adds an insulating condition that prevents direct contact.'),
  callouts:[['12 / 22',L('含金屬離子的快速離子導體','Fast ion conductor containing metal ions')],['13 / 14 / 23 / 24',L('施加偏壓的電極；23 為陰極','Biased electrodes; 23 denotes the cathode')],['15 / 25',L('由負電極方向成長的金屬枝晶','Metal dendrite growing from the negative electrode')]],
  claim:L('權利項 1 包含金屬離子導體、電極與由負端朝正端成長的枝晶；權利項 2 加入相反偏壓使成長反轉。權利項 3 的阻擋條件不能誤套到所有實施例。','Claim 1 covers an ion-containing conductor, electrodes and dendrite growth from negative toward positive. Claim 2 adds opposite-polarity reversal. Claim 3’s blocking condition is an additional limitation, not universal to all embodiments.'),
  bridge:L('對照 ECM 的金屬氧化、離子遷移、還原沉積與反向溶解；不要把金屬絲畫成氧空缺。','Compare ECM metal oxidation, ion migration, reduction/deposition and reverse dissolution. The bridge is metallic, rather than an oxygen-vacancy filament.')
 },
 US5912839A:{
  images:[[0,'Fig. 1',0,2],[1,'Fig. 2',0,3]],
  focus:L('以累積脈衝設定相變材料的可辨識阻態','Use cumulative pulses to reach distinguishable phase-change resistance states'),
  trace:L('先看圖 1 電阻對脈衝電流的非單調關係，再看圖 2 的記憶材料與電極配置。曲線沒有完整量測條件，不能抽取為現行產品規格。','First inspect Figure 1’s nonmonotonic resistance versus pulse-current relationship, then the material/electrode structure in Figure 2. The plot lacks a complete measurement contract for current product specifications.'),
  callouts:[['36',L('相變記憶材料','Phase-change memory material')],['42',L('電極網格結構','Electrode grid structure')],['46',L('隔離層','Insulation layer')]],
  claim:L('權利項 1 聚焦不足以單次 SET、但能與後續脈衝累積的程式化方法；權利項 2 加入 RESET，權利項 3 加入計數額外脈衝的讀法。不是所有 PCM 的一般加熱權利項。','Claim 1 focuses on a program pulse insufficient for a single SET but effective cumulatively with later pulses. Claim 2 adds RESET; claim 3 adds a read method that counts extra pulses. This is more specific than generic PCM heating.'),
  bridge:L('對照 PCM 的溫度與晶相序列，再理解此件專利如何把多次刺激加入資料編碼。','Compare PCM temperature and phase-state sequences, then examine how this patent uses repeated stimulation for data encoding.')
 },
 US4873664A:{
  images:[[1,'Fig. 3 / 4',0,3],[2,'Fig. 5',90,4]],
  focus:L('在感測之後以電路自動還原鐵電資料','Restore ferroelectric data through the sensing circuit'),
  trace:L('由 1T1C 單元沿位元線接到感測與還原電路，再比較 word line 和 plate line 時序。讀出電荷後，原始極化必須依鎖存結果恢復。','Trace the 1T1C cell along the bit line into the sense/restore circuit, then compare word-line and plate-line timing. After charge sensing, the latched result restores the original polarization.'),
  callouts:[['22 / 24',L('鐵電電容與存取電晶體','Ferroelectric capacitor and access transistor')],['32 / 68',L('字線與獨立 plate line','Word line and separate plate line')],['64',L('感測放大器；參照單元提供比較基準','Sense amplifier, with reference cells providing a comparison')]],
  claim:L('權利項 1 限定字線、位元線與獨立 plate line 的單元連接，電容一端經切換元件接到位元線。權利項 2 再加入感測放大器與虛擬鐵電參照單元。','Claim 1 specifies cell connections to word, bit and separate plate lines, with one capacitor electrode connected to the bit line through a switch. Claim 2 adds a sense amplifier and dummy ferroelectric reference cell.'),
  bridge:L('對照 FeRAM 讀取的兩種初始極化、切換電荷差、鎖存與回寫；還原步驟必須在圖中出現。','Compare both initial polarizations, switching-charge contrast, latching and write-back in the FeRAM read plates. Restoration is an explicit stage.')
 },
 US10153155B2:{
  images:[[1,'Fig. 1 / 2',0,3]],
  focus:L('以交替摻雜與熱處理形成鐵電薄膜','Form a ferroelectric film through alternating dopants and heat treatment'),
  trace:L('圖 1／2 比較三層與四層薄膜安排。先辨認材料層與上下導電層，再回讀製程中不同摻雜層和退火的要求。','Figures 1 and 2 compare three- and four-layer film arrangements. Identify the material and outer conducting layers, then read the distinct dopant layers and heating requirements in the process claim.'),
  callouts:[['110 / 120 / 130',L('第一、第二、第三材料層','First, second and third material layers')],['112 / 114',L('上下導電層','Outer conductive layers')],['210 / 220 / 230 / 240',L('延伸的四層配置','Extended four-layer arrangement')]],
  claim:L('權利項 1 是形成薄膜的方法：含鉿與氧的三層材料、兩種不同摻雜層、加熱與兩側導電層。此圖不是完整 FeFET 位元單元，也不能單靠它判定讀寫通道。','Claim 1 is a film-formation method involving three hafnium/oxygen layers, two different dopant layers, heating and conductive layers on both sides. The figure is not a complete FeFET bitcell and does not define its read channel.'),
  bridge:L('把此來源放在 FeFET 的材料／製程限制層；電晶體操作則由下一件具體閘堆疊專利與操作圖補足。','Use this source for FeFET material/process constraints. The next transistor-stack patent and operation plates cover the electrical device.')
 },
 US11502083B2:{
  images:[[1,'Fig. 1',0,3]],
  focus:L('把鐵電薄膜整合進具體複合閘結構','Integrate a ferroelectric film into a specific composite gate'),
  trace:L('沿基板往上逐層核對 31、32、33b、34、35，再沿左右接面回到通道。堆疊包含浮動閘，不能直接標成最簡單的金屬／鐵電／矽。','Read layers 31, 32, 33b, 34 and 35 upward from the substrate, then trace the junctions back to the channel. This stack includes a floating gate and is not the simplest metal/ferroelectric/silicon structure.'),
  callouts:[['31 / 32',L('緩衝層與浮動閘電極','Buffer layer and floating-gate electrode')],['33b / 34 / 35',L('鉿基鐵電層、控制閘與薄膜電極層','Hafnium-based ferroelectric, control gate and film-electrode layer')],['5 / 6 / 71',L('源極、汲極及金屬矽化物接觸','Source, drain and silicide contact')]],
  claim:L('權利項 1 詳列複合閘、隔離、側壁、源汲極與矽化物的相對位置。讀此圖可了解一種實作，不能據此把全部 FeFET 都定義成同一個堆疊。','Claim 1 details the relative positions of the composite gate, isolation, sidewalls, source/drain and silicide. The drawing teaches one implementation, rather than a universal FeFET stack.'),
  bridge:L('對照 FeFET 的極化控制臨界電壓；將材料層與電氣控制端分別標示，才能看清電場落在哪裡。','Compare polarization-controlled threshold shift in FeFETs. Distinguish material layers from electrical terminals to locate the applied field.')
 },
 US20240057343A1:{
  images:[[3,'Fig. 3–5',90,4],[8,'Fig. 15–18',90,9]],
  focus:L('以催化接面與薄鐵電層設計穿隧阻態','Design tunneling states with a catalytic interface and thin ferroelectric layer'),
  trace:L('先看圖 3 的五層堆疊，再以圖 5 比較不同極化的能障；圖 15–18 將同一記憶堆疊接到電晶體。','Read the five-layer stack in Figure 3, then compare polarization-dependent barriers in Figure 5. Figures 15–18 connect memory stacks to transistors.'),
  callouts:[['210 / 220',L('底電極與催化金屬層','Bottom electrode and catalytic metal layer')],['230 / 240 / 250',L('鐵電層、穿隧介電層與頂電極','Ferroelectric layer, tunneling dielectric and top electrode')],['122 / 124 / 200',L('存取閘、源汲區與記憶單元','Access gate, source/drain regions and memory cell')]],
  claim:L('本文件是公開申請文本。權利項 1 結合第一電極、鐵電材料與接觸它的催化金屬；權利項 2–3 才加入特定電負度與厚度限制。完整五層圖含實施例細節，不能全部當成獨立項必要條件。','This is a published application. Claim 1 combines a first electrode, ferroelectric material and contacting catalytic metal; claims 2–3 add particular electronegativity and thickness limits. The five-layer embodiment includes details beyond the independent claim.'),
  bridge:L('對照 FTJ 的極化翻轉與能障變化，並將此堆疊和其他電極／鐵電材料的研究器件分開。','Compare FTJ polarization reversal and barrier changes, keeping this stack distinct from research devices using other electrodes and ferroelectrics.')
 }
};
export function patentStudy(id,language='en'){
 const def=defs[id];if(!def)throw new Error(`缺少專利圖解：${id}`);
 const locale=language==='en'?'en':'zh';
 const record=manifest.patents.find(p=>p.id===id);if(!record)throw new Error(`缺少專利附圖：${id}`);
 return{id,focus:def.focus[locale],trace:def.trace[locale],claim:def.claim[locale],bridge:def.bridge[locale],callouts:def.callouts.map(([number,meaning])=>({number,meaning:meaning[locale]})),figures:def.images.map(([index,label,rotation,page])=>{const fig=record.figures.find(f=>f.index===index);if(!fig)throw new Error(`${id} 附圖 ${index} 不存在`);return{...fig,label,rotation,page,pdfUrl:record.pdfUrl,pdfSHA256:record.pdfSHA256};}),sourceUrl:record.url,claimsAnchor:record.claimsAnchor};
}
