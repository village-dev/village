# type: ignore
import json
import sys

from main import main

if __name__ == "__main__":
    params = None
    if len(sys.argv) > 1:
        params = json.loads(sys.argv[1])
    res = main(params)
    print(json.dumps({"result": res}))
    sys.exit(0)
