# Interactive Model Boundaries

These public reading tools illustrate mechanisms and evidence questions. They do not certify a product, execute security controls, or report measured target-silicon results.

## Automotive ECC

`automotive-model.js` uses an even-parity shortened extended Hamming (72,64) code. Data occupy non-power-of-two positions in 1–71, seven parity bits occupy 1,2,4,8,16,32,64, and position 0 is overall parity. The UI labels them D0–D63 and P0–P7; P7 is overall parity. The syndrome is computed from the error mask relative to a valid codeword, not from its known error count. Decoder indications are displayed separately from the simulator's known injection count.

All 72 single-error positions are locatable and all 2,556 distinct double-error pairs are detected. More than two injected errors are outside the guarantee: positions 3,5,6 can cause an incorrect overall-parity correction indication; adding position 0 makes that four-error mask undetected. No correction is written back. No hardware timing, trap, FTTI, diagnostic-coverage or ASIL result follows from this demonstration.

Source: [TI BQ75614-Q1 datasheet, OTP Error Check and Table 8-22](https://www.ti.com/lit/ds/symlink/bq75614-q1.pdf#page=62). The source supports the parity construction, not an assertion that this page emulates or qualifies that device. Run `node --test tests/automotive-model.test.mjs` for exhaustive single/double-error checks and higher-order counterexamples.

## Thermal Acceleration

AF = exp[(Ea/kB) × (1/Tref − 1/Tstress)], with temperatures in kelvin. The existing defaults, Ea = 0.84 eV and Tref = 55°C, remain **uncalibrated teaching assumptions**. Changing the time marker does not change AF. Curves A/B are arbitrary visual examples; they are not computed from AF, assigned to memory families, or calibrated to measured retention.

The alternative candidate used Ea = 1.1 eV and Tref = 25°C. No target-specific evidence establishes either activation energy as correct. Retain current assumptions explicitly; do not treat a parameter change as improved accuracy. Product projections require the named device, failure mechanism, multi-temperature data, fitted parameters, uncertainty and a justified lifetime distribution.

Sources: [NIST Arrhenius model](https://www.itl.nist.gov/div898/handbook/apr/section1/apr151.htm) and [NIST use-condition reliability projections](https://www.itl.nist.gov/div898/handbook/apr/section4/apr43.htm).

## Tunneling and Breakdown

`tunneling-breakdown-simulator.js` (memory-physics.html) is a teaching model. Both regimes use the same constants: Φ_B = 3.15 eV, B_FN = 250 MV/cm (image-force corrected) and A_FN = 1.54×10⁻⁶ A/V².

- Vox ≥ Φ_B (label `fn`): classic Fowler–Nordheim, J = A_FN·Eox²·exp(−B_FN/Eox).
- 0.05 V < Vox < Φ_B (label `direct`): the generalized FN expression for a trapezoidal barrier, J = A_FN·Eox²·exp(−B_FN·[1 − (1 − Vox/Φ_B)^{3/2}]/Eox). The bracket reaches 1 at Vox = Φ_B, so current and slope join the FN branch continuously; only the regime label changes at Φ_B.
- Vox ≤ 0.05 V returns the low-bias floor; log₁₀J is clamped to [−18, 6]. The readout shows J as m.m×10ⁿ A/cm², or "< 10⁻¹⁴ A/cm²" below that level.

The earlier direct branch used a separate exp(−α·tox·√Φ_eff) expression and jumped by up to about 13 decades at Φ_B. The current form omits the trapezoidal prefactor correction, reverse current, temperature, and trap-assisted tunneling/SILC, so low-bias magnitudes are order-of-magnitude illustrations, not calibrated gate leakage. The 4, 10 and 13 MV/cm field thresholds are illustrative region markers, not breakdown statistics.

Checks: `node --test tests/test-physics-robustness.test.mjs` (continuity at Φ_B, monotonic J–V, unchanged FN values, display format) and `node scripts/驗證穿隧與高溫模型契約.mjs` (canvas curve, readouts, presets, keyboard and both languages).

## Other Reading Tools

- Assurance categories describe evidence types, not the status of a product. Planning-route names may be standards, evaluation schemes or regulatory contexts; they are not equivalent certifications. Product certification requires a traceable certificate, target of evaluation, version and scope.
- IoT dynamic-power reduction holds activity factor, capacitance and frequency constant. It excludes leakage, frequency changes and battery life. The CAM animation redirects an example address without changing OTP bits; it supplies no zero-wait timing proof.
- Specialty cost values are fixed scenario assumptions, not foundry quotations. The 12×12/four-spare-row demonstration reports sample mapping, not production yield or diagnostic coverage. Resistance, trim and waveform numbers are illustrative; panel color count alone does not mandate a memory technology. Existing De-Mura fixed-assumption labels remain in place.
- The OIP lifecycle reader separates persistent data, runtime state and required evidence. It performs no key generation, encryption, storage mutation or assurance test.

`scripts/verify-model-boundaries.mjs` checks desktop/mobile English/Traditional Chinese behavior, keyboard operation, state preservation and the displayed limits. Existing repair, localization, offline and release checks remain required.
