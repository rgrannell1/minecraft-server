#!/bin/sh

MINECRAFT_JAR_URL=`python3 /usr/src/user-data/get-server-url.py`

apt-get update --assume-yes
apt-get install wget screen openjdk-8-jdk --assume-yes

echo "dependencies installed."

if [ $(getent passwd minecraftuser) = "" ]
then
  useradd --system --create-home --home /home/minecraftuser minecraftuser
  usermod --append --groups sudo minecraftuser
else
  echo "minecraftuser exists"
fi

echo "user minecraftuser created."

cd /home/minecraftuser
wget -O minecraft_server.jar "$MINECRAFT_JAR_URL"

chmod +x minecraft_server.jar

echo "downloaded server jar from $MINECRAFT_JAR_URL"

cp /usr/src/user-data/minecraft-server.service /etc/systemd/system/minecraft.service
systemctl enable minecraft
systemctl start minecraft

echo "completed setup"
