# DatabaseProject

## Prerequisites

Make sure you have the following installed:

- **Node.js**
- **npm**
- **Oracle Database**
- **Oracle Instant Client**
- **Running UF VPN Connection**

### Setup Instructions

```bash

1. Clone the repository and then cd into the yt-trends-explorers directory.

2. Run 

npm install

to install the project specific dependencies, 

3. Create .env file and add your Oracle Database login information in the form

DB_USER=
DB_PASSWORD=
DB_CONNECTION_STRING=(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=oracle.cise.ufl.edu)(PORT=1521))(CONNECT_DATA=(SID=orcl)))

4. Run the front end server by running 

npm start

this will start constantly running the front end server in that terminal.

5. To launch the backend server, in another separate terminal, run 

 node server.js