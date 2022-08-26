import requests
import pandas as pd


def main() -> None:
    data = pd.read_csv("./operators.csv")

    for index, row in data.iterrows():
        asnId = row["asn"]
        rank = getAsnRank(asnId)
        data.at[index, "rank"] = rank

    data.sort_values(by=["rank"], inplace=True)

    data.to_csv("./operators.csv", index=False)


def getAsnRank(asnId: int) -> int:
    print(f"INFO: Updating rank for AS{asnId}")

    apiData = requests.get(
        f"https://api.asrank.caida.org/v2/restful/asns/{asnId}"
    ).json()

    if "errors" in apiData:
        print(f"WARN: API error when fetching data for AS{asnId}")

    asn = apiData["data"]["asn"]

    if asn == None:
        print(f"WARN: AS{asnId} not found")

    return asn["rank"]


if __name__ == "__main__":
    # This code won't run if this file is imported.
    main()
