import fs from 'node:fs';
import path from 'node:path';

const zhFile = path.resolve('data/nvm-vendor-patent-maps.json');
const enFile = path.resolve('data/nvm-vendor-patent-maps-en.json');

const zhData = JSON.parse(fs.readFileSync(zhFile, 'utf8'));
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

// Stage 1: 四家廠商深化的專利攻防資料
const stage1Litigation = {
  ememory: {
    zh: {
      title: '專利階梯防禦戰略與公有領域生態',
      overview: '力旺電子的專利戰略展現了半導體 IP 領域極其經典的「雙軌階梯演進」模式。早期透過 NeoBit (US6678190B2 等) 奠定標準 CMOS 0-Mask 浮動閘極規範；當奠基專利於 2022–2023 年相繼屆滿進入公有領域時，力旺早已在先進節點完成 NeoFuse (US8514614B2 / US8982637B2 等) 與 NeoPUF (US10204981B2 等) 的嚴密專利網佈局。',
      keyBattles: [
        {
          heading: '0-Mask 浮動閘極專利防禦圈 (NeoBit Era)',
          detail: '力旺早期以無控制閘極之串聯 PMOS 結構，徹底封鎖了「利用二次電子注入 (CHEI) 於標準 CMOS 製作 EPROM」的最佳技術路徑。競爭對手若欲在標準邏輯製程製作 0-mask OTP，必須繞道採用高壓 NMOS 崩潰或複雜偏壓泵浦，生產良率與面積難以匹敵。2022 年該專利滿 20 年期滿後，此基礎結構已成為全球代工廠免費公共財，但微縮極限止於 65nm。'
        },
        {
          heading: '2nm GAA / FinFET 先進反熔絲防禦網 (NeoFuse Era)',
          detail: '面對 28nm 以下先進製程，力旺以獨家 3T 反熔絲架構 (US8982637B2) 與閘極微觀漏電流讀取方法 (US8514614B2) 構建了全新法律壁壘。該專利權利項牢牢鎖定「低於介電層擊穿電壓之微弱直接穿隧電流判定」，成功阻止競爭者在先進 FinFET/GAA 節點無償複製其反熔絲讀取感測電路。'
        }
      ],
      ftoVerdict: '【自由實施建議】業界目前可完全合法、免授權實施 0.5µm 至 0.11µm 之初代 NeoBit 雙 PMOS 浮閘電路；但在 28nm 及以下先進節點，凡採用 3T 調壓抑制漏電或閘氧微觀穿隧讀取之反熔絲電路，仍受力旺有效專利嚴密保護至 2031–2037 年。'
    },
    en: {
      title: 'Patent Tier Defense Strategy & Public Domain Succession',
      overview: 'eMemory represents a quintessential semiconductor IP strategy of "dual-track tiered evolution." Early foundations laid down by NeoBit (US6678190B2 etc.) established 0-mask logic NVM norms. As foundational patents entered the public domain in 2022–2023, eMemory had already secured pervasive patent rings in advanced nodes through NeoFuse (US8514614B2) and NeoPUF (US10204981B2).',
      keyBattles: [
        {
          heading: 'Zero-Mask Floating Gate Moat (NeoBit Era)',
          detail: 'eMemory secured the premier route for CMOS EPROM via control-gate-free series PMOS with CHEI programming. Competitors seeking 0-mask logic OTP were forced into higher-voltage NMOS breakdown alternatives with inferior yields. Following its 20-year expiration in 2022, this foundational bitcell became free public domain technology, though physically limited to >=65nm.'
        },
        {
          heading: 'FinFET & 2nm GAA Advanced Antifuse Ring (NeoFuse Era)',
          detail: 'For sub-28nm geometries, eMemory constructed fresh barriers around 3T antifuse topologies (US8982637B2) and gate-tunneling readout techniques (US8514614B2), locking down low-voltage sensing of gate tunneling currents to preempt unauthorized adoption across advanced PDK libraries.'
        }
      ],
      ftoVerdict: '[FTO Guidance] The semiconductor industry may freely practice first-generation NeoBit 2-PMOS CHEI topologies (0.5µm–0.11µm) without royalties. However, sub-28nm antifuse designs employing 3T regulation or sub-breakdown gate tunneling sensing remain actively protected through 2031–2037.'
    }
  },

  kilopass: {
    zh: {
      title: 'Kilopass vs. Sidense 世紀專利訴訟與 1T 反熔絲權利邊界',
      overview: '2010 年至 2014 年間爆發的 Kilopass vs. Sidense 專利侵權訴訟，是半導體 IP 歷史上最具指標性的司法攻防。Kilopass 指控 Sidense 的 1T-Fuse 侵犯其 XPM 反熔絲核心專利 (US6992925B2 與 US6777766B2)，最終美國聯邦巡迴上訴法院 (CAFC) 裁定 Sidense 不侵權，確立了半導體專利迴避設計的重要法理邊界。',
      keyBattles: [
        {
          heading: '核心爭點：交叉點單元 (Cross-Point Cell) 之文義涵蓋',
          detail: 'Kilopass 核心專利 US6992925B2 Claim 1 限定記憶單元在列線 (WL) 與行線 (BL) 的交叉點由「單一電晶體構成」，且閘極與源極/汲極之交疊區均勻引發氧化層崩潰。Kilopass 主張 Sidense 的 1T-Fuse 同樣由單一電晶體構成且於交叉點工作，構成文義侵權。'
        },
        {
          heading: 'CAFC 終審判決：Split-Channel 之實質物理不均等',
          detail: 'Sidense 成功證明其專利 US7402855B2 採用「裂通道 (Split-Channel)」物理結構，同一電晶體通道分為厚閘/未擊穿區與薄閘擊穿區。厚閘區域本質上承擔了選擇開關功能，物理上並非均勻交叉點閘極。CAFC 判定 Sidense 未落入專利權利項保護範圍，均等論亦不成立。'
        }
      ],
      ftoVerdict: '【重大產業里程碑】Kilopass 訴訟主力武器專利 US6992925B2 已於 2023 年 3 月屆滿 20 年進入公有領域！這意味著當初纏訟多年的均勻交叉點 1T 閘氧擊穿基礎反熔絲架構，現已成為全球半導體產業界均可自由實施的公有技術。'
    },
    en: {
      title: 'Historic Kilopass v. Sidense Litigation & 1T Antifuse Claim Boundaries',
      overview: 'Between 2010 and 2014, Kilopass and Sidense engaged in one of the semiconductor IP sector\'s landmark patent battles. Kilopass alleged that Sidense 1T-Fuse infringed its foundational XPM patents (US6992925B2 and US6777766B2). The U.S. Court of Appeals for the Federal Circuit (CAFC) ultimately affirmed non-infringement, establishing key boundaries for design-arounds.',
      keyBattles: [
        {
          heading: 'Core Disagreement: Scope of "Cross-Point Bitcell"',
          detail: 'Kilopass US6992925B2 Claim 1 recited a memory cell formed at the cross-point of WL and BL consisting of a single transistor where gate-to-diffusion overlap experiences dielectric breakdown. Kilopass argued Sidense 1T structure literally matched this limitation.'
        },
        {
          heading: 'CAFC Ruling: Substantial Difference of Split-Channel Physics',
          detail: 'Sidense successfully established that its patented Split-Channel (US7402855B2) segregates the channel into thick-oxide access and thin-oxide breakdown regions. The thick-oxide segment intrinsically serves as an access switch, distinct from Kilopass cross-point definition under literal and doctrine-of-equivalents standards.'
        }
      ],
      ftoVerdict: '[Major Landmark] Kilopass primary weapon patent US6992925B2 expired in March 2023 after completing its 20-year term. The foundational uniform cross-point 1T gate-oxide breakdown structure is now globally open for royalty-free implementation.'
    }
  },

  sidense: {
    zh: {
      title: 'Split-Channel 迴避設計之專利典範與公有領域解鎖',
      overview: 'Sidense 的 1T-Fuse 代表了半導體專利迴避設計 (Workaround Design) 的最高水準。面對 Kilopass 早先築起的 1T 交叉點專利高牆，Sidense 創辦團隊並未妥協，而是深入電晶體微觀結構，以「非對稱通道多晶矽覆蓋」成功開創出面積更小且完全自主合法的 1T-Fuse 專利家族。',
      keyBattles: [
        {
          heading: 'Split-Channel 1T 架構專利母案 (US7402855B2)',
          detail: 'Sidense 核心專利限定在單一電晶體內部形成非對稱擴散接面與通道長度分割。薄閘極部分提供受控反熔絲擊穿，而未覆蓋高場薄氧化層的通道部分則保持高阻截止，在完全無需額外選擇電晶體的條件下消除了漏電流。此專利不僅贏得司法訴訟，更成為台積電、格芯等多家代工廠主流 OTP PDK 基準。'
        },
        {
          heading: '雙反熔絲差動感測演進 (US8325514B2 / US8325516B2)',
          detail: '為解決 40nm/28nm 先進節點反熔絲擊穿電阻離散過大之難題，Sidense 於 2009–2010 年佈局雙反熔絲互補單元專利，利用成對的兩顆反熔絲互補讀取，徹底擺脫對絕對參考電阻的依賴，大幅提升高溫車規可靠度。'
        }
      ],
      ftoVerdict: '【重大產業里程碑】Sidense 核心母案專利 US7402855B2 已於 2025 年 9 月屆滿 20 年進入公有領域！業界現在可自由、免專利金採用其標誌性的 Split-Channel 1T 反熔絲架構；但其雙反熔絲差動感測與無接面微縮專利仍有效維持至 2027–2030 年。'
    },
    en: {
      title: 'Split-Channel Workaround Landmark & Public Domain Transition',
      overview: 'Sidense 1T-Fuse stands as an industry benchmark for semiconductor design-around strategies. Confronted by Kilopass prior-art cross-point patents, Sidense engineered an asymmetric split-channel bitcell, achieving superior bitcell density and full legal autonomy.',
      keyBattles: [
        {
          heading: 'Split-Channel 1T Foundation Patent (US7402855B2)',
          detail: 'Sidense defined asymmetric diffusion junctions within a single transistor, partitioning channel length into thin-oxide breakdown and thick-oxide access segments. This eliminated sneak-path leakage without external select transistors, powering production PDKs across TSMC, GF, and UMC.'
        },
        {
          heading: 'Differential Sensing Evolution (US8325514B2 / US8325516B2)',
          detail: 'Addressing post-breakdown resistance variability in sub-40nm nodes, Sidense patented twin-antifuse complementary sensing, reading differential currents between paired antifuses to bypass absolute reference drift and ensure automotive-grade retention.'
        }
      ],
      ftoVerdict: '[Major Landmark] Sidense foundational patent US7402855B2 expired in September 2025 and entered the public domain. The split-channel 1T antifuse topology is now freely implementable; complementary sensing improvements remain protected through 2027–2030.'
    }
  },

  // 上峰案卷沿用具原件來源的正式資料，禁止舊版敘述回填。
  attopsemi: {
    zh: zhData.vendors.find(v=>v.id==='attopsemi').litigationDefense,
    en: enData.vendors.find(v=>v.id==='attopsemi').litigationDefense
  }
};

// 將 litigationDefense 注入到中文版與英文版資料中
function updateVendors(data, isEn) {
  for (const vendor of data.vendors) {
    const lit = stage1Litigation[vendor.id];
    if (lit) {
      vendor.litigationDefense = isEn ? lit.en : lit.zh;
    }
  }
}

updateVendors(zhData, false);
updateVendors(enData, true);

fs.writeFileSync(zhFile, JSON.stringify(zhData, null, 2), 'utf8');
fs.writeFileSync(enFile, JSON.stringify(enData, null, 2), 'utf8');
console.log('Stage 1 四大廠商專利攻防與訴訟深度案卷已成功注入！');
