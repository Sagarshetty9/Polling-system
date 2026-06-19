# TODO - Fix project & make live voting work

- [x] Inspect remaining frontend socket usage and poll components (already inspected key ones, confirm no missing event wiring)
- [x] Patch backend Socket.IO CORS/origin handling to be production-safe but not break local testing when FRONTEND_URL is missing
- [x] Ensure backend emits normalized poll data (ids as strings) so frontend updates correctly
- [x] Add temporary debug logs for socket joins and poll events (remove or gate behind env after verifying)
- [x] Run backend + frontend locally and manually verify: open two clients, join same team room, create poll, vote, verify real-time update
- [x] Clean up debug logs / gate behind env flag

