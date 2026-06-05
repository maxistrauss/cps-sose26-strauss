Projekt Iot







**Komponenten:**





Einfahrt und Ausfahrt 



Parküberwachung



Beleuchtung



Node-Red-Backend



Dashboards( Admin, Zahlung, freie Parkplätze)











Einfahrt



&#x20;	Raspery Pie (mit Edge AI, Kennzeichenerkennung)




&#x09;Senoren: Kamera





&#x20;	Aktoren: Schranke aka mini Motor mit Kartonschranke, Display, LED





Ausfahrt

&#x09;

&#x09;gleich plus RFID Chip







Parküberwachung

&#x20;







Beleuchtung

&#x09;

&#x09;ESP



&#x09;Sensoren: PIR-Bewegunssenoren 



&#x09;Aktoren: 













DB:





Tables:





&#x09;praking\_sessions( id, plate, entry time, Exit time, payment\_time,  exit\_valid\_until, amount\_due,  amount\_paid)





&#x09;parking\_spots(id, floor, spot\_number, occupied, last\_updated)





&#x09;user\_admins (id, Name, rfid\_uid, role, active)





&#x09;rfid\_admin\_releases (id, admin\_id (fk), rfid\_uid, parking\_session\_id, release\_time)





&#x09;event\_logs( id, timestamp, eventtype, source, message, praking\_session\_id)

&#x09;



&#x09;event\_types (id.name ,description)



&#x09;	eventtype: ENTRY\_PLATE\_DETECTED EXIT\_PLATE\_DETECTED ENTRY\_BARRIER\_OPENED EXIT\_BARRIER\_OPENED PAYMENT\_SUCCESS PAYMENT\_FAILED 			RFID\_ADMIN\_RELEASE SENSOR\_ERROR











TO DO:

1. Projekt anlegen





&#x09;mkdir -p smart-parking/sql 

&#x09;mkdir -p smart-parking/dashboard 

&#x09;mkdir -p smart-parking/node-red





&#x09;/home/pi/smart-parking/ 

&#x09;├── sql/ │ 

&#x09;	├── init.sql 

&#x09;	└── seed.sql 

&#x09;├── dashboard/ │ 

&#x09;	├── customer.html │ 

&#x09;	├── admin.html │ 

&#x09;	├── style.css │ 

&#x09;	└── app.js 

&#x09;├── node-red/ 

&#x09;└── README.md

&#x09;

&#x09;

&#x09;touch /home/pi/smart-parking/sql/init.sql 

&#x09;touch /home/pi/smart-parking/sql/seed.sql 

&#x09;touch /home/pi/smart-parking/README.md



2\. DB 



&#x09;install PostgreSQL



&#x09;	sudo apt update

&#x09;	sudo apt install PostgreSQL postgresql-contrib



&#x09;	sudo systemctl status PostgreSQL (prüfen und ggf starten, sudo systemctl start PostgreSQL)

&#x20; 

&#x09;





&#x09;erste Anlegung über Konsole 

&#x09;	sudo -u postgres psql

&#x09;	CREATE DATABASE smart\_parking; 

&#x09;	CREATE USER smart\_parking\_user WITH PASSWORD 'smartparking123'; 

&#x09;	GRANT ALL PRIVILEGES ON DATABASE smart\_parking TO smart\_parking\_user;

&#x09;	\\q



&#x09;	



&#x09;Rechte für schmema setzten

&#x09;	sudo -u postgres psql -d smart\_parking



&#x09;	GRANT ALL ON SCHEMA public TO smart\_parking\_user;

&#x09;	ALTER DEFAULT PRIVILEGES IN SCHEMA public

&#x09;	GRANT ALL ON TABLES TO smart\_parking\_user;



&#x09;	ALTER DEFAULT PRIVILEGES IN SCHEMA public

&#x09;	GRANT ALL ON SEQUENCES TO smart\_parking\_user;

&#x09;	\\q





&#x09;/home/pi/smart-parking/sql/init.sql





&#x09;"DROP TABLE IF EXISTS event\_logs; DROP TABLE IF EXISTS rfid\_admin\_releases; DROP TABLE IF EXISTS event\_types; DROP TABLE IF EXISTS users\_admins; DROP TABLE IF EXISTS parking\_spots; 	DROP TABLE IF EXISTS parking\_sessions; 



&#x09;CREATE TABLE parking\_sessions ( id SERIAL PRIMARY KEY, plate VARCHAR(20) NOT NULL, entry\_time TIMESTAMP NOT NULL DEFAULT CURRENT\_TIMESTAMP, exit\_time TIMESTAMP, payment\_time 	TIMESTAMP, exit\_valid\_until TIMESTAMP, amount\_due NUMERIC(6,2), amount\_paid NUMERIC(6,2) DEFAULT 0 ); CREATE TABLE parking\_spots ( id SERIAL PRIMARY KEY, floor INTEGER NOT NULL, 	spot\_number INTEGER NOT NULL, sensor\_id VARCHAR(50), occupied BOOLEAN DEFAULT FALSE, last\_update TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ); CREATE TABLE users\_admins ( id SERIAL 	PRIMARY KEY, name VARCHAR(100) NOT NULL, rfid\_uid VARCHAR(100) UNIQUE NOT NULL, role VARCHAR(50) DEFAULT 'admin', active BOOLEAN DEFAULT TRUE ); CREATE TABLE event\_types ( id 	SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE, description TEXT ); CREATE TABLE rfid\_admin\_releases ( id SERIAL PRIMARY KEY, admin\_id INTEGER NOT NULL, rfid\_uid 	VARCHAR(100) NOT NULL, parking\_session\_id INTEGER NOT NULL, release\_time TIMESTAMP NOT NULL DEFAULT CURRENT\_TIMESTAMP, CONSTRAINT fk\_admin FOREIGN KEY (admin\_id) REFERENCES 	users\_admins(id), CONSTRAINT fk\_parking\_session\_release FOREIGN KEY (parking\_session\_id) REFERENCES parking\_sessions(id) ); CREATE TABLE event\_logs ( id SERIAL PRIMARY KEY, 	timestamp TIMESTAMP NOT NULL DEFAULT CURRENT\_TIMESTAMP, event\_type\_id INTEGER NOT NULL, source VARCHAR(100), message TEXT, parking\_session\_id INTEGER, CONSTRAINT fk\_event\_type 	FOREIGN KEY (event\_type\_id) REFERENCES event\_types(id), CONSTRAINT fk\_parking\_session\_event FOREIGN KEY (parking\_session\_id) REFERENCES parking\_sessions(id) );"







&#x09;/home/pi/smart-parking/sql/seed.sql





&#x09;INSERT INTO event\_types (id, name, description) VALUES (1, 'ENTRY\_PLATE\_DETECTED', 'Kennzeichen an der Einfahrt erkannt'), (2, 'EXIT\_PLATE\_DETECTED', 'Kennzeichen an der Ausfahrt 	erkannt'), (3, 'ENTRY\_BARRIER\_OPENED', 'Einfahrtsschranke geöffnet'), (4, 'EXIT\_BARRIER\_OPENED', 'Ausfahrtsschranke geöffnet'), (5, 'PAYMENT\_SUCCESS', 'Zahlung erfolgreich 	durchgeführt'), (6, 'PAYMENT\_FAILED', 'Zahlung fehlgeschlagen'), (7, 'EXIT\_WINDOW\_EXPIRED', 'Ausfahrtszeitfenster abgelaufen'), (8, 'RFID\_ADMIN\_RELEASE', 'Manuelle 	Ausfahrtsfreigabe per RFID'), (9, 'SENSOR\_ERROR', 'Sensorfehler erkannt'), (10, 'PARKING\_SESSION\_CREATED', 'Parkvorgang wurde erstellt'), (11, 'PARKING\_SESSION\_CLOSED', 	'Parkvorgang wurde abgeschlossen'); 

&#x09;INSERT INTO parking\_spots (floor, spot\_number, sensor\_id, occupied, last\_update) VALUES (1, 1, 'ultra\_01', FALSE, CURRENT\_TIMESTAMP), (1, 2, 'ultra\_02', TRUE, 	CURRENT\_TIMESTAMP); 

&#x09;INSERT INTO users\_admins (name, rfid\_uid, role, active) VALUES ('Test Admin', 'A1-B2-C3-D4', 'admin', TRUE); 

&#x09;INSERT INTO parking\_sessions ( plate, entry\_time, exit\_time, payment\_time, exit\_valid\_until, amount\_due, amount\_paid ) VALUES ( 'AB123', CURRENT\_TIMESTAMP - INTERVAL '1 hour', 	NULL, NULL, NULL, NULL, 0 ); 	

&#x09;INSERT INTO event\_logs ( event\_type\_id, source, message, parking\_session\_id ) VALUES ( 10, 'seed-data', 'Test-Parkvorgang für Kennzeichen AB123 wurde erstellt', 1 );





&#x09;**Init und seed run :)**


	psql -U smart\_parking\_user -d smart\_parking -f sql/init.sql

&#x09;psql -U smart\_parking\_user -d smart\_parking -f sql/seed.sql



&#x09;PW: smartparking123





&#x09;**Node Red verbinden** 

	Host: localhost

&#x09;Port: 5432

&#x09;Database: smart\_parking	

&#x09;User: smart\_parking\_user 

&#x09;Password: smartparking123







3\. Node Red





&#x09;Flows


		API Flows



&#x09;		Customer: GET /api/session/:plate suchen und dann bezahlen POST /api/payment



&#x09;		Admin: 



&#x09;		Auslastung: 

		Logik Flows

			Lichtsteuerung-Flow



&#x09;		Parkeinfahrt Flow

			Auspark Flow

			Parkplatzsteurng Flow



&#x09;		





4\. Dashbaords bauen 





5\. verknüpfen alles
		 





&#x09;











