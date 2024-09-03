dev_api:
	cd master-thesis-api && npm run start:dev

dev_front:
	cd master-thesis-frontend-ts && npm run dev

make dev: dev_api dev_front