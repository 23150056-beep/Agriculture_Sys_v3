# V4 Rules Engine

## Prioritization Rules
- urgency: max 30
- waiting_time: max 25
- stock_risk: max 25
- distributor_reliability: max 20

## Reliability Rules
- on_time: 40% weight
- proof_quality: 30% weight
- status_completeness: 30% weight

## Reorder Rules
- Trigger reorder alert when projected stockout date falls inside threshold window.

## POD Integrity Rules
- Flag missing receiver name
- Flag missing note/photo
- Flag duplicate image signature
- Flag time anomaly
