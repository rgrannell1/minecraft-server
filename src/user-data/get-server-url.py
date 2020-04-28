
import urllib.request
import json

mc_versions = "https://launchermeta.mojang.com/mc/game/version_manifest.json"

def main():
  version_res = urllib.request.urlopen(mc_versions)
  html = json.loads(version_res.read().decode('utf-8'))

  snapshot_version = html['latest']['snapshot']

  for data in html['versions']:
    if data['id'] == snapshot_version:
      version_url = urllib.request.urlopen(data['url'])
      version_data = json.loads(version_url.read().decode('utf-8'))

      print(version_data['downloads']['server']['url'])

  exit(1)

main()
