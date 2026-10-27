import json,subprocess,pathlib,time
def run(*args):
 return subprocess.run(args,check=True,capture_output=True,text=True,timeout=180).stdout
devices=json.loads(run("xcrun","simctl","list","devices","available","-j"))
available=[d for runtime,group in devices["devices"].items() if "iOS" in runtime for d in group if d.get("isAvailable") and d["name"].startswith("iPhone")]
if not available: raise RuntimeError("No available iPhone simulator")
d=available[0]
if d["state"]!="Booted": run("xcrun","simctl","boot",d["udid"])
run("xcrun","simctl","bootstatus",d["udid"],"-b")
app="mobile/ios/build/Build/Products/Debug-iphonesimulator/AuroraDasVeredas.app"
run("xcrun","simctl","install",d["udid"],app)
launch=run("xcrun","simctl","launch",d["udid"],"org.robonuvem.auroradasveredas")
time.sleep(12)
pathlib.Path("mobile/proof").mkdir(exist_ok=True)
run("xcrun","simctl","io",d["udid"],"screenshot","mobile/proof/ios-launch.png")
pathlib.Path("mobile/proof/ios-launch.json").write_text(json.dumps({"simulator":d["name"],"udid":d["udid"],"launch":launch,"scope":"Compilation, install and launch; authenticated flows still require separate device rehearsal."},indent=2))
print(launch)
