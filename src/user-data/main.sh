#!/bin/sh

MINECRAFT_JAR_URL=`python3 /usr/get-server-url.py`

apt-get update --assume-yes
apt-get install wget screen openjdk-8-jdk --assume-yes

echo "dependencies installed."

adduser minecraftuser
usermod -aG sudo minecraftuser

echo "user minecraftuser created."

cd /home/minecraftuser
wget -O minecraft_server.jar "$MINECRAFT_JAR_URL"
chmod +x minecraft_server.jar

echo "downloaded server jar from $MINECRAFT_JAR_URL"

cp /usr/minecraft-server.service /etc/systemd/system/minecraft.service
systemctl enable minecraft

echo "completed setup"
