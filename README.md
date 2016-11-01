Inferno Emu - An emulator for A3 MMORPG
=======================================

Overview of A3
---------------
A3 - Art, Alive, Attraction is a Korean MMORPG released around 2003. English version of it was officially released in India in 2005 under the banner of Sify. Later due to some issues it was shut down. But the love for the game did not end there. Thanks to RaGEZONE Forum (http://forum.ragezone.com/f98/) some Indians were able to create A3 private server using the files released there. The released files were just executables compiled by the Chinese developers and the source of these executables were never released.

This is an effort to create an open source emulator for A3. If you are developer with a passion for MMORPG you are welcome to help in its development.

Requirements
------------
1. NodeJS
2. MySQL
3. Redis 2.4 or higher (Check https://github.com/rgl/redis/downloads for windows installation)

Running the Project
-------------------
1. Install dependencies using command ``npm install``
2. Create local configuration file named ``main-local.json`` inside config folder and override database connection settings
3. Import database schema from ``data/db.sql`` into your emulator database
4. Insert example test data from ``data/seed.sql``
5. Place all ``.n_ndt`` files found in ``a3server/7Zoneserver/ZoneData/map`` from A3 219 server files released in RaGEZONE to show NPCs in game (Download link: http://www.mediafire.com/file/24jijiaiqa3aaxn/A3+Server+219.rar)
6. Run the command ``node main`` to start the server

Client
------
Emulator has been tested with A3 client version 562. Other client versions may not work!
