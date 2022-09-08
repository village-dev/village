# type: ignore
import json
import sys

from main import main

if __name__ == "__main__":
    params = None
    uuid = None
    if len(sys.argv) == 2:
        params = json.loads(sys.argv[1])
    elif len(sys.argv) > 2:
        params = json.loads(sys.argv[1])
        uuid = sys.argv[2]
    res = main(params)
    print(json.dumps({"result": res, "uuid": uuid}))
    sys.exit(0)
