import urllib.request, json

base = "http://localhost:8000"

# 1. Create business
data = json.dumps({"name": "E2E Test Shop", "industry": "Retail", "location": "Pune", "declaredMonthlyRevenue": 400000}).encode()
req = urllib.request.Request(base + "/api/business-profile", data=data, headers={"Content-Type": "application/json"}, method="POST")
r = json.loads(urllib.request.urlopen(req).read())
biz_id = r["business_id"]
print("1. Profile created:", biz_id)

# 2. Upload transactions
txns = [{"date": "2024-0{}-{:02d}".format((i//10)+1, (i%28)+1), "amount": 20000 + i*1000, "transaction_type": "credit" if i%3!=0 else "debit", "category": "Sales", "payment_method": "UPI", "description": "Txn {}".format(i)} for i in range(30)]
data = json.dumps({"transactions": txns, "business_id": biz_id}).encode()
req = urllib.request.Request(base + "/api/upload-transactions", data=data, headers={"Content-Type": "application/json"}, method="POST")
r = json.loads(urllib.request.urlopen(req).read())
print("2. Uploaded: {} transactions".format(r["transactions_saved"]))

# 3. Analyze
data = json.dumps({"business_id": biz_id}).encode()
req = urllib.request.Request(base + "/api/analyze", data=data, headers={"Content-Type": "application/json"}, method="POST")
r = json.loads(urllib.request.urlopen(req).read())
score = r["scoring"]["score"]
risk = r["scoring"]["riskLevel"]
print("3. Score: {}/100, Risk: {}".format(score, risk))

# 4. Dashboard
r = json.loads(urllib.request.urlopen(base + "/api/dashboard/" + biz_id).read())
print("4. Dashboard: revenue={}, txns={}".format(r["summary"]["monthlyRevenue"], r["summary"]["transactionCount"]))

# 5. Score explanation
r = json.loads(urllib.request.urlopen(base + "/api/score-explanation/" + biz_id).read())
print("5. Score explanation: {} pillars, {} positive drivers".format(len(r["pillars"]), len(r["positiveDrivers"])))

# 6. Trust analysis
r = json.loads(urllib.request.urlopen(base + "/api/trust-analysis/" + biz_id).read())
print("6. Trust: {}".format(r["overall_trust_result"]))

# 7. Credit report
r = json.loads(urllib.request.urlopen(base + "/api/credit-report/" + biz_id).read())
print("7. Report ID:", r["reportId"])

print("\nALL E2E CHECKS PASSED")
