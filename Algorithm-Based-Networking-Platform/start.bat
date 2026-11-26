@echo off
title Kindred - Networking Platform Server
cd /d "%~dp0backend"
echo Starting Kindred Backend and Web Server on http://localhost:5000 ...
start http://localhost:5000
node server.js
pause
