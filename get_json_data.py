import os
import glob
import json


JSON_FOLDER_PATH = './component_source_data'


def find_json_files_list():
    json_files = []

    for file_path in glob.glob(os.path.join(JSON_FOLDER_PATH, '*.json')):
        if file_path.endswith('_data.json'):
            json_files.append(file_path)

    return json_files


def parse_json(source_file_path):
    with open(source_file_path, 'r') as file:
        data = json.load(file)

    return data
