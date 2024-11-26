import json

# Read the file
with open("list.txt", "r", encoding="utf-8") as file:
    data = file.readlines()

# Process the data
result = []

for index, line in enumerate(data, start=1):
    if line.strip():  # Skip empty lines
        parts = line.split("\t")
        entry = {
            "id": int(parts[0].strip()),
            "word": parts[1].strip(),
            "translation": parts[2].strip(),
        }
        result.append(entry)
        # Display current index progress
        print(f"Processing index {index}/{len(data)}")

# Convert to JSON
json_result = json.dumps(result, indent=4, ensure_ascii=False)

# Write to a JSON file
with open("input.json", "w", encoding="utf-8") as json_file:
    json_file.write(json_result)

print("JSON data has been written to 'output.json'")
