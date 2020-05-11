#!/usr/bin/python3

import json

import urllib.request
import json
import os

from dotenv import load_dotenv
load_dotenv()

def get_droplet_ip ():
  return os.getenv("DROPLET_IP")

def get_server_url ():
  mc_versions = "https://launchermeta.mojang.com/mc/game/version_manifest.json"
  version_res = urllib.request.urlopen(mc_versions)
  html = json.loads(version_res.read().decode('utf-8'))

  snapshot_version = html['latest']['snapshot']

  for data in html['versions']:
    if data['id'] == snapshot_version:
      version_url = urllib.request.urlopen(data['url'])
      version_data = json.loads(version_url.read().decode('utf-8'))

      return version_data['downloads']['server']['url']

  raise Exception("did not find URL.")

def main ():
  obj = {
    "_meta": {
      "hostvars": {
        "minecraft_digital_ocean": {
          "ansible_connection": "ssh",
          "ansible_host": get_droplet_ip()
        }
      }
    },
    "minecraft_servers": {
      "hosts": ["minecraft_digital_ocean"],
      "vars": {
        "ms_server_url": get_server_url()
      }
    }
  }

  print(json.dumps(obj))

main()
