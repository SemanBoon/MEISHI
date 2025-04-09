# MEISHI
## HELLO##
## MORE CHANGES ##

#BACKEND
   *install pgAdmin4: https://www.postgresql.org/ftp/pgadmin/pgadmin4/v9.0/
   *install postgres.app: https://postgresapp.com/downloads.html
   *install prisma in your vs code terminal
       npm install @prisma/client --save
       npm install prisma --save-dev
       npx prisma init

Open postgres.app and make sure it's running
Then open PGAdmin4, right click on servers, select register -> Server
Edit the Name to be MEISHI or whatever you want, Click on the Connections tab and make host name localhost, leave everything else the way it is. Type in a password then slect save..


Back to vscode..after running the commands from earlier you should have a .env file..edit the link and replace johndoe with postgres(the username) and password with the password you enterd in pgAdmin4


good to go