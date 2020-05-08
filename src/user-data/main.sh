#!/bin/sh

exit 0

MINECRAFT_JAR_URL=$(python3 /usr/src/user-data/get-server-url.py)

apt-get update --assume-yes && apt-get upgrade --assume-yes && apt-get install wget screen openjdk-8-jdk build-essential --assume-yes

printf "\ndependencies installed.\n"

PWD=$(getent passwd minecraftuser)

if [ "$PWD" = "" ]
then
  useradd --system --create-home --home /home/minecraftuser minecraftuser
  usermod --append --groups sudo minecraftuser
else
  printf "\nminecraftuser exists\n"
fi

printf "\nuser minecraftuser created.\n"

cp /usr/src/user-data/start_minecraft.sh /home/minecraftuser/start_minecraft.sh
cat /usr/src/user-data/motd > /etc/motd

cd /home/minecraftuser || exit 1
wget -O minecraft_server.jar "$MINECRAFT_JAR_URL"

chmod +x minecraft_server.jar

printf "\ndownloaded server jar from $MINECRAFT_JAR_URL\n"

printf "eula=true\n" > eula.txt

git clone https://github.com/Tiiffi/mcrcon.git
cd mcrcon && make && make install && cd -

cp /usr/src/user-data/minecraft-server.service /etc/systemd/system/minecraft.service
systemctl enable minecraft
systemctl start minecraft

printf "\ncompleted setup\n"
