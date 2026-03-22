# V4 Scoring Formulas

## Manager Auto-Priority Queue
score = urgency(30) + waiting_time(25) + stock_risk(25) + distributor_reliability(20)

## Delivery Reliability Score
score = on_time(40) + proof_quality(30) + status_completeness(30)

## Notes
- Current implementation uses prototype-safe deterministic rules.
- Threshold tuning should be configurable in later wave hardening.
