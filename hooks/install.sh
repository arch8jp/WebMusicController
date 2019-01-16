#!/bin/bash
cd /home/ec2-user/repos/musicbot

npm install
npm run build

cp ./hooks/musicbot.service /etc/systemd/system/musicbot.service
/usr/bin/systemctl enable musicbot